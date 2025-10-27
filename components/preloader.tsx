"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import TextPlugin from "gsap/TextPlugin";
import { useRef } from "react";

gsap.registerPlugin(TextPlugin, SplitText);

export default function Preloader() {
  const preloaderRef = useRef<HTMLDivElement | null>(null);
  const splitRef = useRef<SplitText | null>(null);
  const charsRef = useRef<HTMLElement[] | null>([]);
  const originalPositionsRef = useRef<{
    initial: DOMRect;
    last: DOMRect;
  } | null>(null);

  useGSAP(() => {
    const initAnimation = () => {
      const originalOverflow = document.body.style.overflow;
      const originalPointerEvents = document.body.style.pointerEvents;

      document.body.style.overflow = "hidden";
      document.body.style.pointerEvents = "none";

      if (!preloaderRef.current) return;
      const preloaderEl = preloaderRef.current;
      const pEl = preloaderEl.querySelector<HTMLElement>(".preloader-header p");
      const codeEl = preloaderEl.querySelector<HTMLElement>(".code-text");
      const headerEl =
        preloaderEl.querySelector<HTMLElement>(".preloader-header");

      if (!pEl || !codeEl || !headerEl) return;

      pEl.style.visibility = "visible";

      const tl = gsap.timeline({
        delay: 0.25,
        onComplete: () => {
          document.body.style.overflow = originalOverflow;
          document.body.style.pointerEvents = originalPointerEvents;
        },
      });

      const codeText =
        `<div><span class="text-[#569cd6]">public class</span> Main {</div>` +
        `<div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#569cd6]">public static void</span> main(String[] args) {</div>` +
        `<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;System.out.println(<span class="text-[#ce9178]">"¡Hola, Mundo!"</span>);</div>` +
        `<div>&nbsp;&nbsp;&nbsp;&nbsp;}</div>` +
        `<div>}</div>`;

      gsap.set(pEl, { opacity: 0 });

      if (!splitRef.current) {
        splitRef.current = SplitText.create(pEl, {
          type: "chars",
          charsClass: "char",
          mask: "chars",
        });
        charsRef.current = splitRef.current.chars as HTMLElement[];
      }

      const chars = charsRef.current!;
      const initialChar = chars[0];
      const lastChar = chars[chars.length - 4];

      chars.forEach((char, index) => {
        gsap.set(char, { yPercent: index % 2 === 0 ? -100 : 100, opacity: 0 });
      });

      tl.to(codeEl, {
        width: 370.682,
        height: 137.756,
        padding: "12px 8px",
        duration: 1.2,
        ease: "expo.out",
      });

      tl.add(() => {
        const total = codeText.length;
        const proxy = { progress: 0 };

        gsap.to(proxy, {
          progress: 1,
          duration: total * 0.015,
          ease: "none",
          onUpdate: () => {
            const charsToShow = Math.floor(proxy.progress * total);
            codeEl.innerHTML =
              codeText.slice(0, charsToShow) + '<span class="cursor">|</span>';
          },
          onComplete: () => {
            codeEl.innerHTML = codeText;
            tl.play();
          },
        });
        tl.pause();
      });

      tl.to(pEl, { opacity: 1, duration: 0 });

      gsap.set(chars, { willChange: "transform" });

      tl.to(chars, {
        yPercent: 0,
        opacity: 1,
        duration: 2,
        ease: "power3.out",
        stagger: 0.025,
        onComplete: () => {
          gsap.set(chars, { clearProps: "will-change" });
        },
      });

      tl.add(() => {
        codeEl.innerHTML = "";
      });

      tl.to(codeEl, {
        width: 0,
        height: 0,
        padding: 0,
        duration: 1,
        ease: "back.in(1.7)",
      });

      tl.to(chars, {
        y: (index, target) => {
          if (index === 0 || index === chars.length - 4) return 0;
          const char = target as HTMLElement;
          const mask = char.parentElement as HTMLElement;
          if (!mask) return 0;
          const charHeight = char.getBoundingClientRect().height;
          const maskHeight = mask.getBoundingClientRect().height;

          return index % 2 === 0
            ? maskHeight + charHeight
            : -(maskHeight + charHeight);
        },
        duration: 1,
        ease: "power4.inOut",
        stagger: 0.025,
        delay: 0.5,
        onStart: () => {
          const initialCharMask = initialChar.parentElement;
          const lastCharMask = lastChar.parentElement;

          if (
            initialCharMask &&
            initialCharMask.classList.contains("char-mask")
          ) {
            initialCharMask.style.overflow = "visible";
          }

          if (lastCharMask && lastCharMask.classList.contains("char-mask")) {
            lastCharMask.style.overflow = "visible";
          }

          const viewportWidth = window.innerWidth;
          const centerX = viewportWidth / 2;
          const initialCharRect = initialChar.getBoundingClientRect();
          const lastCharRect = lastChar.getBoundingClientRect();
          originalPositionsRef.current = {
            initial: initialCharRect,
            last: lastCharRect,
          };

          gsap.to([initialChar, lastChar], {
            duration: 1,
            ease: "power2.out",
            delay: 0.5,
            x: (i) => {
              if (i === 0) {
                return centerX - initialCharRect.left - initialCharRect.width;
              } else {
                return centerX - lastCharRect.left;
              }
            },
            onComplete: () => {
              gsap.set(headerEl, { mixBlendMode: "difference" });
              gsap.to(headerEl, {
                y: "1rem",
                scale: 0,
                duration: 1.75,
                ease: "power2.out",
              });
            },
          });
        },
      });

      tl.to(preloaderEl.querySelector(".preloader"), {
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 1.75,
        delay: 0.5,
      });
    };

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (
          !splitRef.current ||
          !charsRef.current ||
          !originalPositionsRef.current
        )
          return;

        const { initial, last } = originalPositionsRef.current;
        const viewportWidth = window.innerWidth;
        const centerX = viewportWidth / 2;

        const initialChar = charsRef.current[0];
        const lastChar = charsRef.current[charsRef.current.length - 4];

        gsap.to([initialChar, lastChar], {
          duration: 0.5,
          x: (i) =>
            i === 0
              ? centerX - initial.left - initial.width
              : centerX - last.left,
          ease: "power2.out",
        });
      }, 250);
    };

    window.addEventListener("resize", handleResize);

    initAnimation();

    return () => {
      document.body.style.overflow = "";
      document.body.style.pointerEvents = "";
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div ref={preloaderRef}>
      <div className="preloader">
        <code className="code-text text-[#d4d4d4] bg-[#3F3E3E] rounded-md font-mono text-sm leading-relaxed whitespace-pre"></code>
      </div>
      <div className="preloader-header">
        <p>Flash Page</p>
      </div>
    </div>
  );
}
