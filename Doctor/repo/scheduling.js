import scheduleModel from "../model/scheduleModel.js";



export const setSchedule = async (availableSlots) => {
    return await scheduleModel.insertMany(availableSlots[0]);
}

export const updateSchedule = async ({ payload, availableSlots }) => {
    let updated = null;
    for (const slots of availableSlots) {
        updated = await scheduleModel.updateMany(
                payload, 
                { $set: { slots: slots[0].slots } },
        );
    }

    return updated;
};

export const getScheule = async ({payload}) => {
    return await scheduleModel.find(payload);
}