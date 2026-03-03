const { redisClient } = require("../config//redis");

const cache =(duration) => async (req, res , next) => {
    const key =  `${req.user}:${req.originalUrl}`;

    try{
        const cached = await redisClient.get(key);
        if(cached) {
            console.log("Cached Hit:", key);
            return  res.json(JSON.parse(cached));

        }

        const  originalJson = res.json.bind(res);
        res.json =  async (data) => {
            await redisClient.setEx(key, duration, JSON.stringify(data));
            return originalJson(data);
        };
        next();
    } catch (error) {
        console.error("Cache error:", error);
        next();
    }
};

module.exports = cache;