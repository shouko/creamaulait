const { Router } = require('express');

const Mail = require('./models/Mail');

const router = new Router();
const nameParamPattern = /\?name=[A-Za-z0-9%]+/g;

router.get('/', async (req, res) => {
  try {
    const {
      offset, limit,
    } = req.query;
    const docs = await Mail.find({}, {
      'payload.subject': 1,
      'payload.from': 1,
      'payload.to': 1,
      'payload.text': 1,
      createdAt: 1,
      updatedAt: 1,
    }).sort({
      createdAt: -1,
    }).skip(Number(offset) || 0).limit(Number(limit) || 20);
    return res.json(docs.map(({
      _id, payload, createdAt, updatedAt,
    }) => ({
      _id,
      createdAt,
      updatedAt,
      payload: {
        ...payload,
        text: payload.text.replace(nameParamPattern, ''),
      },
    })));
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await Mail.findOne({ _id: id });
    return res.json({
      ...result,
      payload: {
        ...result.payload,
        text: result.payload.text.replace(nameParamPattern, ''),
        html: result.payload.html.replace(/https?:\/\/url[^/]+\/wf[^"]+/g, ''),
      },
    });
  } catch (e) {
    console.error(e);
    return res.sendStatus(500);
  }
});

module.exports = router;
