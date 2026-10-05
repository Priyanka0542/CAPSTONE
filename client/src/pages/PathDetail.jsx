import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Starfield from '../components/common/Starfield';
import ProgressRing from '../components/common/ProgressRing';
import Toast from '../components/common/Toast';
import ThemeToggle from '../components/common/ThemeToggle';
import PeerBenchmark from '../components/PeerBenchmark';
import ResourcesModal from '../components/common/ResourcesModal';
import JobOffersModal from '../components/common/JobOffersModal';
import { calculateProgress, calculateTimelineStats } from '../utils/pathUtils';
import { getResourcesForMilestone } from '../data/milestoneResources';
import { getJobResourcesForCareer } from '../data/jobResources';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { jsPDF } from 'jspdf';

export default function PathDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [path, setPath] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [resourcesModal, setResourcesModal] = useState({ isOpen: false, milestone: null, resources: [] });
  const [jobOffersModal, setJobOffersModal] = useState({ isOpen: false, resources: [] });

  useEffect(() => {
    const fetchPath = async () => {
      try {
        const { data } = await api.get(`/paths/${id}`);
        setPath(data.path);
      } catch {
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchPath();
  }, [id, navigate]);

  const handleCompleteMilestone = async (stepId) => {
    try {
      const { data } = await api.patch(`/paths/${id}/milestone/${stepId}`, { completed: true });
      setPath(data.path);
      setToast({ message: 'Milestone completed!', type: 'success' });
      window.dispatchEvent(new CustomEvent('badges-updated'));
    } catch {
      setToast({ message: 'Failed to update milestone', type: 'error' });
    }
  };

  const handleOpenResources = (milestone) => {
    const resources = getResourcesForMilestone(milestone, path.goalTitle);
    setResourcesModal({
      isOpen: true,
      milestone: milestone,
      resources: resources
    });
  };

  const handleOpenJobOffers = () => {
    const resources = getJobResourcesForCareer(path.goalTitle);
    setJobOffersModal({
      isOpen: true,
      resources: resources
    });
  };

  const handleExportReport = () => {
    if (!path) return;
    const stats = calculateTimelineStats(path);
    const doc = new jsPDF('p', 'mm', 'a4');
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();
    const ml = 20;
    const cw = pw - ml * 2;
    const maxY = ph - 20;
    let y = 0;

    // PDF-safe colors (RGB arrays)
    const PURPLE = [138, 92, 255];
    const DARK = [17, 24, 39];
    const GRAY = [75, 85, 99];
    const LIGHT = [156, 163, 175];
    const GREEN = [5, 150, 105];
    const AMBER = [217, 119, 6];
    const RED = [220, 38, 38];

    // Derived data from path
    const completedCount = path.roadmap.filter((s) => s.completed).length;
    const totalCount = path.roadmap.length;
    const prog = calculateProgress(path);
    const isDone = path.status === 'completed' || prog === 100;
    const userName = user?.name || 'User';

    // Currency formatter safe for built-in PDF fonts
    const fmtINR = (n) => {
      if (!n && n !== 0) return 'N/A';
      if (n >= 10000000) return 'INR ' + (n / 10000000).toFixed(1) + ' Cr';
      if (n >= 100000) return 'INR ' + (n / 100000).toFixed(1) + ' L';
      return 'INR ' + n.toLocaleString('en-IN');
    };

    // Page-break helper: ensures `h` mm of space, else starts new page
    const needPage = (h) => {
      if (y + h > maxY) { doc.addPage(); y = 25; }
    };

    // Sanitize text for PDF-safe rendering with built-in helvetica (Win-1252).
    // Normalizes Unicode dashes/hyphens to ASCII hyphen-minus, removes
    // zero-width characters that cause letter-spacing gaps, and converts
    // smart quotes to ASCII equivalents.
    const sanitize = (text) => {
      if (!text) return '';
      return String(text)
        .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015\u2212\uFE58\uFE63\uFF0D]/g, '-')
        .replace(/[\u2018\u2019\u201A\u2039\u203A]/g, "'")
        .replace(/[\u201C\u201D\u201E\u00AB\u00BB]/g, '"')
        .replace(/[\u200B\u200C\u200D\u2060\uFEFF\u00AD]/g, '')
        .replace(/\u00A0/g, ' ')
        .replace(/[\u2026]/g, '...')
        .replace(/[\u2022\u2023\u25E6\u2043\u2219]/g, '-');
    };

    // ============================================================
    //  PAGE 1 - COVER / SUMMARY
    // ============================================================
    y = 25;

    // FutureEra brand
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PURPLE);
    doc.text('FutureEra', ml, y);
    y += 8;

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...LIGHT);
    doc.text('AI CAREER PATH SIMULATOR  |  PERSONAL ROADMAP', ml, y);
    y += 7;

    // Generated date + user name
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    const genDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    doc.text('Generated: ' + genDate, ml, y);
    y += 4;
    doc.text('Prepared for: ' + userName, ml, y);
    y += 8;

    // Purple divider rule
    doc.setDrawColor(...PURPLE);
    doc.setLineWidth(0.8);
    doc.line(ml, y, pw - ml, y);
    y += 8;

    // Career goal title
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.splitTextToSize(sanitize(path.goalTitle), cw).forEach((l) => {
      doc.text(l, ml, y);
      y += 8;
    });
    y += 1;

    // Status badge (IN PROGRESS / COMPLETED)
    const statusLabel = isDone ? 'COMPLETED' : 'IN PROGRESS';
    const statusC = isDone ? GREEN : PURPLE;
    const statusBg = isDone ? [220, 252, 231] : [237, 233, 254];
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    const stW = doc.getTextWidth(statusLabel);
    doc.setFillColor(...statusBg);
    doc.roundedRect(ml, y - 3, stW + 8, 5, 1.5, 1.5, 'F');
    doc.setTextColor(...statusC);
    doc.text(statusLabel, ml + 4, y);
    y += 10;

    // Stats grid - 3 columns x 2 rows
    const statItems = [
      { lbl: 'PROGRESS', val: prog + '%' },
      { lbl: 'DURATION', val: stats.targetDurationText },
      { lbl: 'ESTIMATED COST', val: fmtINR(path.estimatedCostINR) },
      { lbl: 'PROJECTED SALARY', val: fmtINR(path.estimatedOutcomeSalaryINR) + '/yr' },
      { lbl: 'RISK LEVEL', val: (path.riskLevel || 'N/A').toUpperCase() },
      { lbl: 'WEEKLY WORKLOAD', val: (stats.estimatedWeeklyHours || 20) + ' hrs/wk' },
    ];
    const colW = cw / 3;
    const gridY = y;
    statItems.forEach((s, i) => {
      const cx = ml + (i % 3) * colW;
      const cy = gridY + Math.floor(i / 3) * 16;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...LIGHT);
      doc.text(s.lbl, cx, cy);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      if (s.lbl === 'RISK LEVEL') {
        const rc = path.riskLevel === 'high' ? RED : path.riskLevel === 'medium' ? AMBER : GREEN;
        doc.setTextColor(...rc);
      } else {
        doc.setTextColor(...DARK);
      }
      doc.text(String(s.val), cx, cy + 6);
    });
    y = gridY + Math.ceil(statItems.length / 3) * 16 + 4;

    // Light divider
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.3);
    doc.line(ml, y, pw - ml, y);
    y += 8;

    // Roadmap progress heading
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('ROADMAP PROGRESS - ' + completedCount + ' of ' + totalCount + ' phases complete', ml, y);
    y += 7;

    // Progress bar (rounded)
    doc.setFillColor(229, 231, 235);
    doc.roundedRect(ml, y, cw, 5, 2, 2, 'F');
    if (prog > 0) {
      doc.setFillColor(...PURPLE);
      doc.roundedRect(ml, y, Math.max(4, cw * prog / 100), 5, 2, 2, 'F');
    }
    if (prog >= 10) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(prog + '%', ml + 3, y + 3.5);
    }
    y += 14;

    // Assumptions section
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...AMBER);
    doc.text('ASSUMPTIONS & FACTORS', ml, y);
    y += 5;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRAY);
    doc.splitTextToSize(sanitize(path.assumptions || 'N/A'), cw).forEach((l) => {
      needPage(4);
      doc.text(l, ml, y);
      y += 3.5;
    });
    y += 5;

    // Disclaimer box
    needPage(14);
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(ml, y, cw, 11, 2, 2, 'F');
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...AMBER);
    doc.text('Estimates are AI-generated based on stated assumptions and general data - not guarantees.', ml + 4, y + 4);
    doc.text('Use this as a planning aid, not a prediction.', ml + 4, y + 8);
    y += 17;

    // Roadmap section header
    needPage(20);
    doc.setDrawColor(...PURPLE);
    doc.setLineWidth(0.8);
    doc.line(ml, y, pw - ml, y);
    y += 6;
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...PURPLE);
    doc.text('CAREER ROADMAP - PHASE-BY-PHASE PLAN', ml, y);
    y += 10;

    // ============================================================
    //  ROADMAP PHASES
    // ============================================================
    path.roadmap.forEach((step, i) => {
      needPage(25);

      // MONTH label (left) + status badge (right) on same line
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...PURPLE);
      doc.text('MONTH ' + step.month, ml, y);

      const badge = step.completed ? 'DONE' : 'PENDING';
      const bColor = step.completed ? GREEN : LIGHT;
      const bBg = step.completed ? [220, 252, 231] : [243, 244, 246];
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      const bW = doc.getTextWidth(badge);
      const bX = pw - ml - bW - 8;
      doc.setFillColor(...bBg);
      doc.roundedRect(bX, y - 3, bW + 8, 5, 1.5, 1.5, 'F');
      doc.setTextColor(...bColor);
      doc.text(badge, bX + 4, y);
      y += 6;

      // Milestone title (full width)
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...DARK);
      doc.splitTextToSize(sanitize(step.milestone), cw).forEach((l) => {
        doc.text(l, ml, y);
        y += 5;
      });
      y += 3;

      // Tasks with drawn bullet circles for PDF-safe rendering
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      step.tasks.forEach((task) => {
        const taskLines = doc.splitTextToSize(sanitize(task), cw - 12);
        taskLines.forEach((tl, ti) => {
          needPage(4);
          if (ti === 0) {
            doc.setFillColor(...GRAY);
            doc.circle(ml + 5, y - 1, 0.7, 'F');
          }
          doc.setTextColor(...GRAY);
          doc.text(tl, ml + 9, y);
          y += 3.8;
        });
      });
      y += 4;

      // Phase separator line
      if (i < path.roadmap.length - 1) {
        doc.setDrawColor(229, 231, 235);
        doc.setLineWidth(0.2);
        doc.line(ml, y, pw - ml, y);
        y += 6;
      }
    });

    // ============================================================
    //  FOOTERS - added to every page after all content is laid out
    // ============================================================
    const totalPages = doc.internal.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.2);
      doc.line(ml, ph - 15, pw - ml, ph - 15);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...LIGHT);
      const ft = 'FutureEra  |  Career path report  |  Page ' + p + ' of ' + totalPages;
      doc.text(ft, (pw - doc.getTextWidth(ft)) / 2, ph - 10);
    }

    doc.save(path.goalTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_report.pdf');
    setToast({ message: 'PDF report downloaded!', type: 'success' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="spinner" style={{ width: 36, height: 36 }} />
      </div>
    );
  }

  if (!path) return null;

  const riskColors = { low: 'var(--success)', medium: 'var(--warning)', high: 'var(--danger)' };

  const formatINR = (num) => {
    if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const progress = calculateProgress(path);
  const completedMilestones = path.roadmap.filter((m) => m.completed).length;
  const isCompleted = path.status === 'completed' || progress === 100;
  const timelineStats = calculateTimelineStats(path);

  const chartData = path.roadmap.map((step) => ({
    month: `M${step.month}`,
    progress: step.completed ? 100 : 0,
  }));

  return (
    <div className="min-h-screen relative">
      <Starfield />

      <div className="relative z-10">
        <nav
          className="flex items-center justify-between px-6 py-4 shadow-sm"
          style={{
            background: 'var(--card)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <Link
            to="/dashboard"
            className="text-2xl font-extrabold text-starlight tracking-tight hover:opacity-90 transition-opacity"
          >
            <span className="text-comet-violet">Future</span>Era
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <button
              onClick={handleExportReport}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1"
            >
              📄 Export report
            </button>

            <Link
              to="/dashboard"
              className="btn-secondary text-xs py-1.5 px-3"
            >
              ← Dashboard
            </Link>
          </div>
        </nav>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

          <div className="card mb-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

              <div>
                <h1 className="text-2xl font-extrabold text-starlight mb-2 tracking-tight">
                  {path.goalTitle}
                </h1>

                <div className="flex items-center gap-2 flex-wrap">

                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{
                      color: riskColors[path.riskLevel],
                      background: `${riskColors[path.riskLevel]}18`,
                    }}
                  >
                    {path.riskLevel} risk
                  </span>

                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      isCompleted
                        ? 'bg-aurora-teal text-white'
                        : 'bg-comet-violet text-white'
                    }`}
                  >
                    {isCompleted
                      ? '✓ Completed'
                      : `${completedMilestones}/${path.roadmap.length} milestones (${progress}%)`}
                  </span>

                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full border border-card-border"
                    style={{
                      background: 'var(--surface-secondary)',
                      color: 'var(--text-primary)',
                    }}
                  >
                    {timelineStats.timelineHealth}
                  </span>

                  <span
                    className="text-xs font-bold px-2.5 py-1 rounded-full border border-comet-violet/30 text-comet-violet"
                    style={{ background: 'var(--surface-secondary)' }}
                  >
                    Pace: {timelineStats.currentPace}
                  </span>

                </div>
              </div>

              <ProgressRing
                progress={progress}
                size={80}
                strokeWidth={5}
              />
            </div>

            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-4"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div>
                <p className="text-xs font-semibold text-dust-gray uppercase tracking-wider mb-1">
                  Target Duration
                </p>
                <p className="text-base font-bold text-starlight">
                  {timelineStats.targetDurationText}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-dust-gray uppercase tracking-wider mb-1">
                  Target Deadline
                </p>
                <p className="text-base font-bold text-starlight">
                  {timelineStats.targetCompletionDateText}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-dust-gray uppercase tracking-wider mb-1">
                  Time Remaining
                </p>
                <p className="text-base font-bold text-starlight">
                  {timelineStats.timeRemainingText}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-dust-gray uppercase tracking-wider mb-1">
                  Weekly Workload
                </p>
                <p className="text-base font-bold text-comet-violet">
                  {timelineStats.estimatedWeeklyHours} hrs/wk
                </p>
              </div>

              <div
                className="pt-2"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <p className="text-xs font-semibold text-dust-gray uppercase tracking-wider mb-1">
                  Estimated Cost
                </p>
                <p className="text-base font-bold text-starlight">
                  {formatINR(path.estimatedCostINR)}
                </p>
              </div>

              <div
                className="pt-2"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <p className="text-xs font-semibold text-dust-gray uppercase tracking-wider mb-1">
                  Est. Annual Salary
                </p>
                <p className="text-base font-bold text-aurora-teal">
                  {formatINR(path.estimatedOutcomeSalaryINR)}/yr
                </p>
              </div>

              <div
                className="pt-2"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <p className="text-xs font-semibold text-dust-gray uppercase tracking-wider mb-1">
                  Time Elapsed
                </p>
                <p className="text-base font-bold text-starlight">
                  {timelineStats.timeElapsedText}
                </p>
              </div>

              <div
                className="pt-2"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <p className="text-xs font-semibold text-dust-gray uppercase tracking-wider mb-1">
                  Timeline Health
                </p>
                <p className="text-base font-bold text-starlight">
                  {timelineStats.timelineHealth}
                </p>
              </div>
            </div>
          </div>

          {/* Peer Benchmark */}
          <div className="mb-6 animate-fadeIn" style={{ animationDelay: '0.05s' }}>
            <PeerBenchmark goalTitle={path.goalTitle} />
          </div>

          <div
            className="card mb-6 animate-fadeIn"
            style={{ animationDelay: '0.1s' }}
          >
            <h2 className="text-sm font-bold text-solar-amber mb-2 flex items-center gap-1">
              ⚠ Assumptions & Factors
            </h2>

            <p className="text-sm font-medium text-starlight leading-relaxed">
              {path.assumptions}
            </p>
          </div>

          <div className="ai-disclaimer mb-6">
            Estimates are AI-generated based on stated assumptions and general
            data — not guarantees. Use this as a planning aid, not a prediction.
          </div>

          <div
            className="card mb-6 animate-fadeIn"
            style={{ animationDelay: '0.2s' }}
          >
            <h2 className="text-base font-extrabold text-starlight mb-4">
              Progress overview
            </h2>

            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                />

                <XAxis
                  dataKey="month"
                  tick={{
                    fill: 'var(--dust-gray)',
                    fontSize: 11,
                  }}
                />

                <YAxis
                  tick={{
                    fill: 'var(--dust-gray)',
                    fontSize: 11,
                  }}
                  domain={[0, 100]}
                />

                <Tooltip
                  contentStyle={{
                    background: 'var(--card)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                  }}
                />

                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke="var(--aurora-teal)"
                  strokeWidth={3}
                  dot={{
                    fill: 'var(--aurora-teal)',
                    r: 4,
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div
            className="animate-fadeIn"
            style={{ animationDelay: '0.3s' }}
          >
            <h2 className="text-xl font-extrabold text-starlight mb-4">
              Roadmap
            </h2>

            <div className="space-y-0 relative">

              <div
                className="absolute left-[15px] top-0 bottom-0 w-[2px]"
                style={{ background: 'var(--border)' }}
              />

              {path.roadmap.map((step, i) => {

                const isCurrent =
                  !step.completed &&
                  (i === 0 || path.roadmap[i - 1]?.completed);

                const dotColor = step.completed
                  ? 'var(--aurora-teal)'
                  : isCurrent
                  ? 'var(--comet-violet)'
                  : 'var(--dust-gray)';

                return (
                  <div
                    key={step._id}
                    className="relative pl-10 pb-6"
                  >

                    <div
                      className="absolute left-[9px] top-1 w-[14px] h-[14px] rounded-full border-2"
                      style={{
                        borderColor: dotColor,
                        backgroundColor: step.completed
                          ? dotColor
                          : 'var(--card)',
                        boxShadow: isCurrent
                          ? `0 0 12px ${dotColor}`
                          : 'none',
                      }}
                    />

                    <div
                      className={`card ${
                        isCurrent ? 'animate-pulse-glow' : ''
                      }`}
                    >

                      <div className="flex items-start justify-between">

                        <div>
                          <span className="text-xs font-bold text-comet-violet uppercase tracking-wider">
                            Month {step.month}
                          </span>

                          <h3 className="text-base font-extrabold text-starlight mt-0.5">
                            {step.milestone}
                          </h3>
                        </div>

                        <div className="flex gap-2">
                          <button
                            className="btn-secondary text-[11px] py-1 px-3 flex items-center gap-1"
                            onClick={() => handleOpenResources(step.milestone)}
                            title="View learning resources"
                          >
                            📚 Resources
                          </button>

                          {!step.completed && (
                            <button
                              className="btn-secondary text-[11px] py-1 px-3"
                              onClick={() =>
                                handleCompleteMilestone(step._id)
                              }
                            >
                              Mark done
                            </button>
                          )}

                          {step.completed && (
                            <span className="text-xs font-bold text-aurora-teal flex items-center">
                              ✓ Done
                            </span>
                          )}
                        </div>

                      </div>

                      <ul className="mt-3 space-y-1.5">

                        {step.tasks.map((task, j) => (
                          <li
                            key={j}
                            className="text-xs font-medium text-starlight flex items-start gap-2"
                          >
                            <span
                              className="mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{
                                background: dotColor,
                              }}
                            />

                            {task}
                          </li>
                        ))}

                      </ul>

                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Job Offers Button - Shows locked state or unlocked when all milestones are completed */}
          <div className="animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="card p-6 text-center">
              {isCompleted ? (
                <>
                  <div className="text-4xl mb-3">🎉</div>
                  <h3 className="text-lg font-extrabold text-starlight mb-2">
                    Congratulations! You've completed all milestones!
                  </h3>
                  <p className="text-sm text-dust-gray mb-4">
                    You're now ready to explore job opportunities in this field.
                  </p>
                  <button
                    className="btn-primary py-2 px-6 text-sm font-bold"
                    onClick={handleOpenJobOffers}
                  >
                    💼 View Job Opportunities
                  </button>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">🔒</div>
                  <h3 className="text-lg font-extrabold text-starlight mb-2">
                    Job Opportunities Locked
                  </h3>
                  <p className="text-sm text-dust-gray mb-4">
                    Complete all milestones to unlock job opportunities for this career path.
                  </p>
                  <button
                    className="btn-secondary py-2 px-6 text-sm font-bold opacity-50 cursor-not-allowed"
                    disabled
                  >
                    💼 View Job Opportunities
                  </button>
                  <p className="text-xs text-dust-gray mt-3">
                    Progress: {completedMilestones}/{path.roadmap.length} milestones completed
                  </p>
                </>
              )}
            </div>
          </div>

        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ResourcesModal
        isOpen={resourcesModal.isOpen}
        onClose={() => setResourcesModal({ isOpen: false, milestone: null, resources: [] })}
        milestone={resourcesModal.milestone}
        resources={resourcesModal.resources}
      />

      <JobOffersModal
        isOpen={jobOffersModal.isOpen}
        onClose={() => setJobOffersModal({ isOpen: false, resources: [] })}
        goalTitle={path?.goalTitle}
        jobResources={jobOffersModal.resources}
      />
    </div>
  );
}