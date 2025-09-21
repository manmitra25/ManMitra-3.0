// controllers/hubController.js
import HubContent from "../models/HubContent.js";

const createContent = async (req, res) => {
  try {
    const { title, description, category, subtype, url, duration, authors, metadata, isPublished } = req.body;
    if (!title || !category || !subtype) {
      return res.status(400).json({ message: "title, category and subtype required" });
    }

    const content = await HubContent.create({
      title,
      description,
      category,
      subtype,
      url,
      duration,
      authors,
      metadata,
      createdBy: req.user._id,
      isPublished: isPublished ?? true
    });

    return res.status(201).json(content);
  } catch (err) {
    console.error("createContent error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const listContent = async (req, res) => {
  try {
    const { category, subtype, q, page = 1, limit = 20 } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (subtype) filter.subtype = subtype;
    if (q) filter.title = { $regex: q, $options: "i" };

    const contents = await HubContent.find(filter)
      .sort({ publishDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json(contents);
  } catch (err) {
    console.error("listContent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const getContent = async (req, res) => {
  try {
    const content = await HubContent.findById(req.params.id).populate("createdBy", "username email");
    if (!content) return res.status(404).json({ message: "Not found" });
    res.json(content);
  } catch (err) {
    console.error("getContent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const updateContent = async (req, res) => {
  try {
    const content = await HubContent.findById(req.params.id);
    if (!content) return res.status(404).json({ message: "Not found" });

    const allowed = ["title","description","url","metadata","isPublished","subtype","category","duration","authors"];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) content[field] = req.body[field];
    });

    await content.save();
    res.json(content);
  } catch (err) {
    console.error("updateContent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export { createContent, listContent, getContent, updateContent };
