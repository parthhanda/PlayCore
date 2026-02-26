const Tournament = require('../models/Tournament');
const Match = require('../models/Match');

const runTournamentCleanup = async () => {
    try {
        console.log('[Cleanup Job] Running routine tournament cleanup...');
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        // 1. Mark tournaments as completed if endDate is passed
        const completedResult = await Tournament.updateMany(
            { endDate: { $lt: now }, status: { $ne: 'completed' } },
            { $set: { status: 'completed' } }
        );

        if (completedResult.modifiedCount > 0) {
            console.log(`[Cleanup Job] Marked ${completedResult.modifiedCount} tournaments as completed.`);
        }

        // 2. Permanently delete tournaments 1 day after endDate
        const toDelete = await Tournament.find({ endDate: { $lt: oneDayAgo } });

        if (toDelete.length > 0) {
            const tournamentIds = toDelete.map(t => t._id);
            const matchIds = toDelete.reduce((acc, t) => {
                if (t.matches && t.matches.length > 0) {
                    return acc.concat(t.matches);
                }
                return acc;
            }, []);

            if (matchIds.length > 0) {
                await Match.deleteMany({ _id: { $in: matchIds } });
            }

            await Tournament.deleteMany({ _id: { $in: tournamentIds } });
            console.log(`[Cleanup Job] Permanently deleted ${toDelete.length} expired tournaments and associated matches.`);
        }
    } catch (error) {
        console.error('[Cleanup Job] Error during tournament cleanup:', error);
    }
};

const startCleanupJobs = () => {
    // Run roughly 5 seconds after application startup
    setTimeout(runTournamentCleanup, 5000);
    // Then run every hour (60 * 60 * 1000 ms)
    setInterval(runTournamentCleanup, 60 * 60 * 1000);
};

module.exports = { startCleanupJobs };
