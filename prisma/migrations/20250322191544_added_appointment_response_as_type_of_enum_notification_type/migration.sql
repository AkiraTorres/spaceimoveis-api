-- AlterTable
ALTER TABLE `notifications` MODIFY `type` ENUM('message', 'appointment', 'share', 'like', 'follow', 'share_response', 'appointment_response') NOT NULL DEFAULT 'message';
