-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_sender_email_fkey` FOREIGN KEY (`sender_email`) REFERENCES `users`(`email`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_email_fkey` FOREIGN KEY (`user_email`) REFERENCES `users`(`email`) ON DELETE RESTRICT ON UPDATE CASCADE;
