const { getOrCreateUrl } = require('../db/queries');

async function monitor(req, res) {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    await getOrCreateUrl(url);

    res.json({
      message: 'URL registered successfully',
      url,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = { monitor };