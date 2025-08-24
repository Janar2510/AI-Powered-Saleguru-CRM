import React from 'react';
import { CalendarEvent } from '../../types/calendar';
import { Badge } from '../ui/Badge';

interface EventDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: CalendarEvent;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  isOpen,
  onClose,
  event,
  onEdit,
  onDelete
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (startString: string, endString: string) => {
    const start = new Date(startString);
    const end = new Date(endString);
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    
    if (minutes < 60) {
      return `${minutes} minutes`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 
        ? `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes` 
        : `${hours} hour${hours > 1 ? 's' : ''}`;
    }
  };

  const getEventTypeBadge = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Badge variant="primary" size="sm">Meeting</Badge>;
      case 'call':
        return <Badge variant="success" size="sm">Call</Badge>;
      case 'demo':
        return <Badge variant="warning" size="sm">Demo</Badge>;
      case 'task':
        return <Badge variant="secondary" size="sm">Task</Badge>;
      case 'follow-up':
        return <Badge variant="info" size="sm">Follow-up</Badge>;
      case 'internal':
        return <Badge variant="secondary" size="sm">Internal</Badge>;
      default:
        return <Badge variant="secondary" size="sm">{type}</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-secondary-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-700">
          <div className="flex items-center space-x-3">
            <div className="flex space-x-2">
              {getEventTypeBadge(event.event_type)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-secondary-400 hover:text-white hover:bg-secondary-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Event Title */}
          <div>
            <h3 className="text-2xl font-semibold text-white">{event.title}</h3>
            {event.description && (
              <p className="text-secondary-300 mt-2">{event.description}</p>
            )}
          </div>

          {/* Event Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-primary-500 mt-1" />
                <div>
                  <div className="text-sm text-secondary-400">Date & Time</div>
                  <div className="text-white">{formatDateTime(event.start_time)}</div>
                  <div className="text-secondary-300 text-sm mt-1">
                    Duration: {formatDuration(event.start_time, event.end_time)}
                  </div>
                </div>
              </div>
              
              {event.location && (
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-primary-500 mt-1" />
                  <div>
                    <div className="text-sm text-secondary-400">Location</div>
                    <div className="text-white">{event.location}</div>
                  </div>
                </div>
              )}
              
              {event.related_deal_id && (
                <div className="flex items-start space-x-3">
                  <Target className="w-5 h-5 text-primary-500 mt-1" />
                  <div>
                    <div className="text-sm text-secondary-400">Related Deal</div>
                    <div className="text-white">{event.deal_title}</div>
                  </div>
                </div>
              )}
              
              {event.related_task_id && (
                <div className="flex items-start space-x-3">
                  <CheckSquare className="w-5 h-5 text-primary-500 mt-1" />
                  <div>
                    <div className="text-sm text-secondary-400">Related Task</div>
                    <div className="text-white">{event.task_title}</div>
                  </div>
                </div>
              )}
              
              {event.related_contact_id && (
                <div className="flex items-start space-x-3">
                  <User className="w-5 h-5 text-primary-500 mt-1" />
                  <div>
                    <div className="text-sm text-secondary-400">Related Contact</div>
                    <div className="text-white">{event.contact_name}</div>
                  </div>
                </div>
              )}
            </div>
            
            <div>
              <div className="flex items-start space-x-3 mb-4">
                <Users className="w-5 h-5 text-primary-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm text-secondary-400">Attendees ({event.attendees.length})</div>
                  <div className="space-y-2 mt-2">
                    {event.attendees.map((attendee) => (
                      <div key={attendee.id} className="flex items-center justify-between p-2 bg-secondary-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-medium">
                              {attendee.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">{attendee.name}</div>
                            <div className="text-xs text-secondary-400">{attendee.email}</div>
                          </div>
                        </div>
                        <Badge 
                          variant={
                            attendee.status === 'accepted' 
                              ? 'success' 
                              : attendee.status === 'declined' 
                                ? 'danger' 
                                : 'secondary'
                          } 
                          size="sm"
                        >
                          {attendee.status}
                        </Badge>
                      </div>
                    ))}
                    
                    {event.attendees.length === 0 && (
                      <div className="text-sm text-secondary-400">No attendees</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-secondary-700">
            <div className="text-sm text-secondary-500">
              Created: {new Date(event.created_at).toLocaleString()}
            </div>
            
            <div className="flex space-x-2">
              {showConfirmDelete ? (
                <div className="flex items-center space-x-2 bg-red-900/20 p-2 rounded-lg">
                  <span className="text-red-300 text-sm">Confirm delete?</span>
                  <button
                    onClick={() => onDelete(event.id)}
                    className="p-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="p-1 bg-secondary-600 text-white rounded hover:bg-secondary-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => onEdit(event)}
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => setShowConfirmDelete(true)}
                    className="btn-secondary flex items-center space-x-2 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;