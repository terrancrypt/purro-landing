import { gsap } from "gsap";

export function initPurroAnimation() {
  if (typeof document !== "undefined") {
    const catBody = document.getElementById("purro-body");

    if (catBody) {
      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.addLabel("purroAnimation", 0);

      tl.to(
        catBody,
        {
          y: -15,
          duration: 1,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        },
        "purroAnimation"
      );
    }
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("DOMContentLoaded", initPurroAnimation);
}
