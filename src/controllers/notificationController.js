// Notification feature has been removed.
// Push notifications (expo-server-sdk) are no longer used in this project.
// This file is kept as a placeholder to avoid import errors if referenced elsewhere.

export const savePushToken = async (req, res) => {
    res.status(410).json({ success: false, message: 'Push notifications are not supported.' });
};
