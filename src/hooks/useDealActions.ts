import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useToastContext } from '../contexts/ToastContext';

export interface CreateNoteData {
  content: string;
  is_private?: boolean;
  tags?: string[];
}

export interface CreateCallData {
  type: 'inbound' | 'outbound';
  duration_minutes?: number;
  outcome: 'connected' | 'voicemail' | 'no_answer' | 'busy';
  notes?: string;
  follow_up_required?: boolean;
  recording_url?: string;
}

export interface CreateEmailData {
  to: string[];
  cc?: string[];
  bcc?: string[];
  subject: string;
  body: string;
  template_id?: string;
  scheduled_at?: string;
  attachments?: string[];
}

export interface CreateMeetingData {
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  meeting_url?: string;
  attendees: string[];
  agenda?: string;
  meeting_type: 'in_person' | 'video_call' | 'phone_call';
}

export interface UploadFileData {
  file: File;
  category?: string;
  description?: string;
  is_public?: boolean;
}

export const useDealActions = (dealId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const { showToast } = useToastContext();

  // Add a note to the deal
  const addNote = async (noteData: CreateNoteData) => {
    if (!dealId) return null;
    
    setIsLoading(true);
    try {
      // Insert the note activity
      const { data: activity, error: activityError } = await supabase
        .from('deal_activities')
        .insert({
          deal_id: dealId,
          type: 'note',
          title: 'Note Added',
          description: noteData.content,
          metadata: {
            is_private: noteData.is_private || false,
            tags: noteData.tags || [],
          },
          created_by: 'current-user-id', // TODO: Get from auth context
        })
        .select(`
          *,
          created_by_user:users(id, name)
        `)
        .single();

      if (activityError) throw activityError;

      showToast('Note added successfully', 'success');
      return activity;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to add note';
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Log a call
  const logCall = async (callData: CreateCallData) => {
    if (!dealId) return null;
    
    setIsLoading(true);
    try {
      // Insert call activity
      const { data: activity, error: activityError } = await supabase
        .from('deal_activities')
        .insert({
          deal_id: dealId,
          type: 'call',
          title: `${callData.type === 'inbound' ? 'Incoming' : 'Outgoing'} Call`,
          description: callData.notes || `${callData.outcome} - ${callData.duration_minutes || 0} minutes`,
          metadata: {
            type: callData.type,
            duration_minutes: callData.duration_minutes,
            outcome: callData.outcome,
            follow_up_required: callData.follow_up_required,
            recording_url: callData.recording_url,
          },
          created_by: 'current-user-id',
        })
        .select(`
          *,
          created_by_user:users(id, name)
        `)
        .single();

      if (activityError) throw activityError;

      // If there's a recording, also log it as a file
      if (callData.recording_url) {
        await supabase
          .from('deal_files')
          .insert({
            deal_id: dealId,
            name: `Call Recording - ${new Date().toISOString()}`,
            type: 'audio/mp3',
            size: 0, // Unknown size for URL
            url: callData.recording_url,
            uploaded_by: 'current-user-id',
          });
      }

      showToast('Call logged successfully', 'success');
      return activity;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to log call';
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Send email (via Edge Function)
  const sendEmail = async (emailData: CreateEmailData) => {
    if (!dealId) return null;
    
    setIsLoading(true);
    try {
      // Call Edge Function to send email
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          dealId,
          ...emailData,
          from: 'current-user-email', // TODO: Get from auth context
        },
      });

      if (emailError) throw emailError;

      // Log email activity
      const { data: activity, error: activityError } = await supabase
        .from('deal_activities')
        .insert({
          deal_id: dealId,
          type: 'email',
          title: `Email: ${emailData.subject}`,
          description: `Sent to: ${emailData.to.join(', ')}`,
          metadata: {
            to: emailData.to,
            cc: emailData.cc,
            bcc: emailData.bcc,
            subject: emailData.subject,
            template_id: emailData.template_id,
            scheduled_at: emailData.scheduled_at,
            message_id: emailResult?.messageId,
          },
          created_by: 'current-user-id',
        })
        .select(`
          *,
          created_by_user:users(id, name)
        `)
        .single();

      if (activityError) throw activityError;

      showToast('Email sent successfully', 'success');
      return { activity, emailResult };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Schedule a meeting
  const scheduleMeeting = async (meetingData: CreateMeetingData) => {
    if (!dealId) return null;
    
    setIsLoading(true);
    try {
      // Insert meeting activity
      const { data: activity, error: activityError } = await supabase
        .from('deal_activities')
        .insert({
          deal_id: dealId,
          type: 'meeting',
          title: meetingData.title,
          description: `Scheduled for ${new Date(meetingData.scheduled_at).toLocaleString()}`,
          metadata: {
            scheduled_at: meetingData.scheduled_at,
            duration_minutes: meetingData.duration_minutes,
            location: meetingData.location,
            meeting_url: meetingData.meeting_url,
            attendees: meetingData.attendees,
            agenda: meetingData.agenda,
            meeting_type: meetingData.meeting_type,
          },
          created_by: 'current-user-id',
        })
        .select(`
          *,
          created_by_user:users(id, name)
        `)
        .single();

      if (activityError) throw activityError;

      // TODO: Integrate with calendar service (Google Calendar, Outlook, etc.)
      
      showToast('Meeting scheduled successfully', 'success');
      return activity;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to schedule meeting';
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Upload file
  const uploadFile = async (fileData: UploadFileData) => {
    if (!dealId) return null;
    
    setIsLoading(true);
    try {
      const { file, category, description, is_public } = fileData;
      
      // Upload file to Supabase Storage
      const fileName = `${dealId}/${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('deal-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('deal-files')
        .getPublicUrl(fileName);

      // Insert file record
      const { data: fileRecord, error: fileError } = await supabase
        .from('deal_files')
        .insert({
          deal_id: dealId,
          name: file.name,
          type: file.type,
          size: file.size,
          url: publicUrl,
          category: category || 'general',
          description: description || '',
          is_public: is_public || false,
          uploaded_by: 'current-user-id',
        })
        .select(`
          *,
          uploaded_by_user:users(id, name)
        `)
        .single();

      if (fileError) throw fileError;

      // Log file upload activity
      await supabase
        .from('deal_activities')
        .insert({
          deal_id: dealId,
          type: 'file_upload',
          title: 'File Uploaded',
          description: `Uploaded: ${file.name}`,
          metadata: {
            file_id: fileRecord.id,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            category,
          },
          created_by: 'current-user-id',
        });

      showToast('File uploaded successfully', 'success');
      return fileRecord;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload file';
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete file
  const deleteFile = async (fileId: string) => {
    setIsLoading(true);
    try {
      // Get file details first
      const { data: fileData, error: fetchError } = await supabase
        .from('deal_files')
        .select('url, name')
        .eq('id', fileId)
        .single();

      if (fetchError) throw fetchError;

      // Extract filename from URL for storage deletion
      const fileName = fileData.url.split('/').pop();
      if (fileName) {
        // Delete from storage
        const { error: storageError } = await supabase.storage
          .from('deal-files')
          .remove([fileName]);

        if (storageError) {
          console.error('Storage deletion error:', storageError);
          // Continue with database deletion even if storage fails
        }
      }

      // Delete from database
      const { error: deleteError } = await supabase
        .from('deal_files')
        .delete()
        .eq('id', fileId);

      if (deleteError) throw deleteError;

      showToast('File deleted successfully', 'success');
      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete file';
      showToast(errorMessage, 'error');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Create task
  const createTask = async (taskData: {
    title: string;
    description?: string;
    due_date?: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    assigned_to?: string;
  }) => {
    if (!dealId) return null;
    
    setIsLoading(true);
    try {
      // Insert task
      const { data: task, error: taskError } = await supabase
        .from('tasks')
        .insert({
          ...taskData,
          deal_id: dealId,
          type: 'deal_follow_up',
          status: 'pending',
          created_by: 'current-user-id',
        })
        .select()
        .single();

      if (taskError) throw taskError;

      // Log task creation activity
      await supabase
        .from('deal_activities')
        .insert({
          deal_id: dealId,
          type: 'task',
          title: 'Task Created',
          description: `Created task: ${taskData.title}`,
          metadata: {
            task_id: task.id,
            due_date: taskData.due_date,
            priority: taskData.priority,
            assigned_to: taskData.assigned_to,
          },
          created_by: 'current-user-id',
        });

      showToast('Task created successfully', 'success');
      return task;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create task';
      showToast(errorMessage, 'error');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    // State
    isLoading,
    
    // Actions
    addNote,
    logCall,
    sendEmail,
    scheduleMeeting,
    uploadFile,
    deleteFile,
    createTask,
  };
};
