window.addEventListener("orientationchange", function () {
  const popups = document.querySelectorAll(
    "ngb-tooltip-window,[ngbdropdownmenu]"
  );
  popups.forEach((el) => el.classList.remove("show"));
});
