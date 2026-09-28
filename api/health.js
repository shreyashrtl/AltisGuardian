module.exports = (req, res) => {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.statusCode = 200;
    res.end(JSON.stringify({
        status: 'ok',
        service: 'AltisGuardian API',
        pcbProfiles: 10000
    }));
};
