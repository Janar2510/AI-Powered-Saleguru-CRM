import React from 'react';
import { X, Zap, Building, User, Mail, Phone, Globe, MapPin, Briefcase, Calendar, FileText, Users, DollarSign, Code, Award, BookOpen } from 'lucide-react';
import { ContactEnrichmentData, CompanyEnrichmentData } from '../../services/enrichmentService';
import Badge from '../ui/Badge';

interface EnrichmentPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'contact' | 'company';
  data: ContactEnrichmentData | CompanyEnrichmentData | null;
  onApply: () => void;
}

const EnrichmentPreviewModal: React.FC<EnrichmentPreviewModalProps> = ({
  isOpen,
  onClose,
  type,
  data,
  onApply
}) => {
  if (!isOpen || !data) return null;

  const renderContactPreview = (data: ContactEnrichmentData) => (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">{data.name}</h3>
          <p className="text-secondary-400">{data.position} {data.company ? `at ${data.company}` : ''}</p>
          {data.location && (
            <div className="flex items-center space-x-1 mt-1 text-secondary-500">
              <MapPin className="w-4 h-4" />
              <span>{data.location}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
              <Mail className="w-4 h-4 text-primary-500" />
              <span>Contact Information</span>
            </h4>
            <div className="space-y-2">
              {data.email && (
                <div className="flex items-center justify-between p-2 bg-secondary-700 rounded-lg">
                  <span className="text-secondary-400">Email</span>
                  <span className="text-white">{data.email}</span>
                </div>
              )}
              {data.phone && (
                <div className="flex items-center justify-between p-2 bg-secondary-700 rounded-lg">
                  <span className="text-secondary-400">Phone</span>
                  <span className="text-white">{data.phone}</span>
                </div>
              )}
              {data.linkedin_url && (
                <div className="flex items-center justify-between p-2 bg-secondary-700 rounded-lg">
                  <span className="text-secondary-400">LinkedIn</span>
                  <a 
                    href={data.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    View Profile
                  </a>
                </div>
              )}
              {data.twitter_url && (
                <div className="flex items-center justify-between p-2 bg-secondary-700 rounded-lg">
                  <span className="text-secondary-400">Twitter</span>
                  <a 
                    href={data.twitter_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    View Profile
                  </a>
                </div>
              )}
            </div>
          </div>

          {data.experience && data.experience.length > 0 && (
            <div>
              <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
                <Briefcase className="w-4 h-4 text-primary-500" />
                <span>Experience</span>
              </h4>
              <div className="space-y-2">
                {data.experience.map((exp, index) => (
                  <div key={index} className="p-2 bg-secondary-700 rounded-lg">
                    <div className="font-medium text-white">{exp.title}</div>
                    <div className="text-secondary-400">{exp.company}</div>
                    <div className="text-sm text-secondary-500">{exp.years}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {data.education && data.education.length > 0 && (
            <div>
              <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-primary-500" />
                <span>Education</span>
              </h4>
              <div className="space-y-2">
                {data.education.map((edu, index) => (
                  <div key={index} className="p-2 bg-secondary-700 rounded-lg">
                    <div className="font-medium text-white">{edu.degree}</div>
                    <div className="text-secondary-400">{edu.institution}</div>
                    <div className="text-sm text-secondary-500">{edu.years}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.skills && data.skills.length > 0 && (
            <div>
              <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
                <Award className="w-4 h-4 text-primary-500" />
                <span>Skills</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {data.bio && (
            <div>
              <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-primary-500" />
                <span>Bio</span>
              </h4>
              <p className="text-secondary-300 p-2 bg-secondary-700 rounded-lg">
                {data.bio}
              </p>
            </div>
          )}
        </div>
      </div>

      {data.source && (
        <div className="text-xs text-secondary-500 mt-2">
          Data source: {data.source}
        </div>
      )}
    </div>
  );

  const renderCompanyPreview = (data: CompanyEnrichmentData) => (
    <div className="space-y-6">
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 bg-secondary-700 rounded-lg flex items-center justify-center overflow-hidden">
          {data.logo_url ? (
            <img 
              src={data.logo_url} 
              alt={data.name || 'Company logo'} 
              className="w-full h-full object-contain"
            />
          ) : (
            <Building className="w-8 h-8 text-secondary-400" />
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-white">{data.name}</h3>
          <p className="text-secondary-400">{data.industry} • {data.size}</p>
          {data.headquarters && (
            <div className="flex items-center space-x-1 mt-1 text-secondary-500">
              <MapPin className="w-4 h-4" />
              <span>{data.headquarters}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
              <Building className="w-4 h-4 text-primary-500" />
              <span>Company Information</span>
            </h4>
            <div className="space-y-2">
              {data.website && (
                <div className="flex items-center justify-between p-2 bg-secondary-700 rounded-lg">
                  <span className="text-secondary-400">Website</span>
                  <a 
                    href={data.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 transition-colors"
                  >
                    {data.website.replace(/^https?:\/\//i, '')}
                  </a>
                </div>
              )}
              {data.founded && (
                <div className="flex items-center justify-between p-2 bg-secondary-700 rounded-lg">
                  <span className="text-secondary-400">Founded</span>
                  <span className="text-white">{data.founded}</span>
                </div>
              )}
              {data.revenue && (
                <div className="flex items-center justify-between p-2 bg-secondary-700 rounded-lg">
                  <span className="text-secondary-400">Revenue</span>
                  <span className="text-white">{data.revenue}</span>
                </div>
              )}
              {data.social_profiles && (
                <div className="p-2 bg-secondary-700 rounded-lg">
                  <div className="text-secondary-400 mb-1">Social Profiles</div>
                  <div className="flex space-x-2">
                    {data.social_profiles.linkedin && (
                      <a 
                        href={data.social_profiles.linkedin} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        LinkedIn
                      </a>
                    )}
                    {data.social_profiles.twitter && (
                      <a 
                        href={data.social_profiles.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        Twitter
                      </a>
                    )}
                    {data.social_profiles.facebook && (
                      <a 
                        href={data.social_profiles.facebook} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary-400 hover:text-primary-300 transition-colors"
                      >
                        Facebook
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {data.key_people && data.key_people.length > 0 && (
            <div>
              <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary-500" />
                <span>Key People</span>
              </h4>
              <div className="space-y-2">
                {data.key_people.map((person, index) => (
                  <div key={index} className="p-2 bg-secondary-700 rounded-lg">
                    <div className="font-medium text-white">{person.name}</div>
                    <div className="text-secondary-400">{person.position}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.funding && (
            <div>
              <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-primary-500" />
                <span>Funding</span>
              </h4>
              <div className="p-2 bg-secondary-700 rounded-lg">
                <div className="font-medium text-white">Total: {data.funding.total}</div>
                {data.funding.rounds && data.funding.rounds.length > 0 && (
                  <div className="mt-2">
                    <div className="text-secondary-400 mb-1">Latest Round:</div>
                    <div className="text-white">{data.funding.rounds[0].amount} ({data.funding.rounds[0].date})</div>
                    <div className="text-secondary-500 text-sm">
                      Investors: {data.funding.rounds[0].investors.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {data.description && (
            <div>
              <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
                <FileText className="w-4 h-4 text-primary-500" />
                <span>Description</span>
              </h4>
              <p className="text-secondary-300 p-2 bg-secondary-700 rounded-lg">
                {data.description}
              </p>
            </div>
          )}

          {data.technologies && data.technologies.length > 0 && (
            <div>
              <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
                <Code className="w-4 h-4 text-primary-500" />
                <span>Technologies</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.technologies.map((tech, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {data.competitors && data.competitors.length > 0 && (
            <div>
              <h4 className="font-medium text-white mb-2 flex items-center space-x-2">
                <Users className="w-4 h-4 text-primary-500" />
                <span>Competitors</span>
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.competitors.map((competitor, index) => (
                  <Badge key={index} variant="secondary" size="sm">
                    {competitor}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {data.source && (
        <div className="text-xs text-secondary-500 mt-2">
          Data source: {data.source}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600/30 rounded-full flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {type === 'contact' ? 'Contact Enrichment' : 'Company Enrichment'}
              </h3>
              <p className="text-sm text-secondary-400">
                Data enriched from LinkedIn and web sources
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {type === 'contact' 
            ? renderContactPreview(data as ContactEnrichmentData)
            : renderCompanyPreview(data as CompanyEnrichmentData)
          }
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-secondary-700">
          <div className="text-sm text-secondary-400">
            Data enriched via LinkedIn and web scraping
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={onApply}
              className="btn-primary flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Apply Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrichmentPreviewModal;