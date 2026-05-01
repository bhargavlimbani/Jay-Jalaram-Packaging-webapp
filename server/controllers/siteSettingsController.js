const SiteSetting = require("../models/SiteSetting");
const {
  defaultBranding,
  defaultHome,
} = require("../utils/siteSettingsDefaults");

const parseSettingValue = (value, fallback) => {
  if (!value) return fallback;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : fallback;
  } catch (error) {
    return fallback;
  }
};

const ensureSetting = async (key, defaultValue) => {
  let setting = await SiteSetting.findOne({ where: { key } });

  if (!setting) {
    setting = await SiteSetting.create({
      key,
      value: JSON.stringify(defaultValue),
    });
  }

  return setting;
};

const getSettingPayload = async (key, defaultValue) => {
  const setting = await ensureSetting(key, defaultValue);
  const parsed = parseSettingValue(setting.value, defaultValue);
  return { setting, parsed };
};

const getAllSettings = async (req, res) => {
  try {
    const brandingPayload = await getSettingPayload("branding", defaultBranding);
    const homePayload = await getSettingPayload("home", defaultHome);
    return res.json({
      branding: brandingPayload.parsed,
      home: homePayload.parsed,
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to load site settings." });
  }
};

const getBrandingSettings = async (req, res) => {
  try {
    const payload = await getSettingPayload("branding", defaultBranding);
    return res.json(payload.parsed);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load branding settings." });
  }
};

const getHomeSettings = async (req, res) => {
  try {
    const payload = await getSettingPayload("home", defaultHome);
    return res.json(payload.parsed);
  } catch (error) {
    return res.status(500).json({ message: "Unable to load home settings." });
  }
};

const updateBrandingSettings = async (req, res) => {
  try {
    const payload = await getSettingPayload("branding", defaultBranding);
    const incoming = req.body && typeof req.body === "object" ? req.body : {};
    const nextValue = {
      ...defaultBranding,
      ...payload.parsed,
      ...incoming,
    };

    payload.setting.value = JSON.stringify(nextValue);
    await payload.setting.save();
    return res.json({ message: "Branding settings updated.", data: nextValue });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update branding settings." });
  }
};

const updateHomeSettings = async (req, res) => {
  try {
    const payload = await getSettingPayload("home", defaultHome);
    const incoming = req.body && typeof req.body === "object" ? req.body : {};
    const nextValue = {
      ...defaultHome,
      ...payload.parsed,
      ...incoming,
    };

    payload.setting.value = JSON.stringify(nextValue);
    await payload.setting.save();
    return res.json({ message: "Home settings updated.", data: nextValue });
  } catch (error) {
    return res.status(500).json({ message: "Unable to update home settings." });
  }
};

module.exports = {
  getAllSettings,
  getBrandingSettings,
  getHomeSettings,
  updateBrandingSettings,
  updateHomeSettings,
};
