import Modal from './Modal';

export default function JobOffersModal({ isOpen, onClose, goalTitle, jobResources }) {
  if (!jobResources || jobResources.length === 0) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Job Opportunities">
        <div className="text-center py-6">
          <p className="text-sm text-dust-gray">No job resources available for this career path yet.</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Job Opportunities: ${goalTitle}`}>
      <div className="space-y-4">
        {jobResources.map((resource, index) => (
          <div
            key={index}
            className="p-4 rounded-lg border border-card-border hover:border-aurora-teal/50 transition-all"
            style={{ background: 'var(--surface-secondary)' }}
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl flex-shrink-0">
                {resource.type === 'job-board' && '💼'}
                {resource.type === 'company' && '🏢'}
                {resource.type === 'freelance' && '🚀'}
                {resource.type === 'remote' && '🌍'}
                {resource.type === 'specialized' && '🎯'}
                {resource.type === 'startup' && '💡'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-starlight mb-1">{resource.title}</h4>
                <p className="text-xs text-dust-gray mb-2 line-clamp-2">{resource.description}</p>
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-bold text-aurora-teal hover:text-aurora-teal/80 transition-colors"
                >
                  View Jobs
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
