import Modal from './Modal';

export default function ResourcesModal({ isOpen, onClose, milestone, careerPath }) {
  if (!milestone) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Learning Resources">
        <div className="text-center py-6">
          <p className="text-sm text-dust-gray">No milestone selected.</p>
        </div>
      </Modal>
    );
  }

  const careerPathName = (careerPath || '').trim();
  const milestoneName = (milestone || '').trim();
  const searchQuery = careerPathName ? `${careerPathName} ${milestoneName}` : milestoneName;
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Learning Resources">
      <div className="space-y-4">
        {/* Context: Career Path & Milestone */}
        <div
          className="p-3.5 rounded-lg border border-card-border"
          style={{ background: 'var(--surface-secondary)' }}
        >
          {careerPathName && (
            <div className="mb-1.5 flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-dust-gray">
                Career Path:
              </span>
              <span
                className="text-xs font-bold text-comet-violet px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(167, 139, 250, 0.12)' }}
              >
                {careerPathName}
              </span>
            </div>
          )}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-dust-gray block mb-0.5">
              Milestone:
            </span>
            <h3 className="text-sm font-extrabold text-starlight leading-snug">
              {milestoneName}
            </h3>
          </div>
        </div>

        {/* Resources Options */}
        <div className="space-y-3">
          {/* Google Option */}
          <a
            href={googleSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-lg border border-card-border hover:border-comet-violet/50 hover:bg-comet-violet/5 transition-all group cursor-pointer"
            style={{ background: 'var(--surface-secondary)' }}
            id="resource-google-link"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.13C3.25 21.32 7.31 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.58H1.27C.46 8.2 0 10.04 0 12s.46 3.8 1.27 5.42l4.01-3.13z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.25 2.68 1.27 6.58l4.01 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-starlight mb-1 group-hover:text-comet-violet transition-colors">
                  Google
                </h4>
                <p className="text-xs text-dust-gray mb-2">
                  Search &ldquo;{searchQuery}&rdquo; on Google
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-comet-violet group-hover:underline">
                  Search on Google
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </a>

          {/* YouTube Option */}
          <a
            href={youtubeSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-lg border border-card-border hover:border-meteor-red/50 hover:bg-meteor-red/5 transition-all group cursor-pointer"
            style={{ background: 'var(--surface-secondary)' }}
            id="resource-youtube-link"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="#FF0000">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-starlight mb-1 group-hover:text-meteor-red transition-colors">
                  YouTube
                </h4>
                <p className="text-xs text-dust-gray mb-2">
                  Search &ldquo;{searchQuery}&rdquo; on YouTube
                </p>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-meteor-red group-hover:underline">
                  Search on YouTube
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </a>
        </div>
      </div>
    </Modal>
  );
}
