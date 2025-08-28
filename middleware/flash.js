const exposeFlashMsgs = (req, res, next) => {
  res.locals.notice = req.flash("notice");
  res.locals.error = req.flash("error");
  next();
};

module.exports = {
  exposeFlashMsgs,
};
