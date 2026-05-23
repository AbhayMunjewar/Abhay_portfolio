"use client";

import { useEffect, useRef } from "react";

export default function Home() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const loaderFillRef = useRef<SVGCircleElement>(null);
  const loaderPercentRef = useRef<HTMLSpanElement>(null);
  const loaderStatusRef = useRef<HTMLSpanElement>(null);
  const scrollBarRef = useRef<HTMLDivElement>(null);
  const robotCanvasRef = useRef<HTMLDivElement>(null);
  const terminalContentRef = useRef<HTMLDivElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  const counterProjectsRef = useRef<HTMLParagraphElement>(null);
  const counterHackathonsRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let destroyed = false;
    let cleanup = () => {
      destroyed = true;
    };

    // Dynamically import client-only libraries
    Promise.all([
      import("gsap").then((m) => m.gsap),
      import("gsap/ScrollTrigger").then((m) => m.ScrollTrigger),
      import("three"),
      import("@studio-freight/lenis"),
    ]).then(([gsap, ScrollTrigger, THREE, { default: Lenis }]) => {
      if (destroyed) {
        return;
      }

      gsap.registerPlugin(ScrollTrigger);

      const removers: Array<() => void> = [];
      const addListener = (
        target: EventTarget,
        type: string,
        handler: (event: Event) => void
      ) => {
        target.addEventListener(type, handler);
        removers.push(() => target.removeEventListener(type, handler));
      };
      const trackedTimeouts: number[] = [];
      const schedule = (fn: () => void, delay: number) => {
        const timeoutId = window.setTimeout(() => {
          const index = trackedTimeouts.indexOf(timeoutId);
          if (index !== -1) {
            trackedTimeouts.splice(index, 1);
          }
          if (!destroyed) {
            fn();
          }
        }, delay);

        trackedTimeouts.push(timeoutId);
        return timeoutId;
      };
      let progressInterval: number | undefined;
      let rafId = 0;
      let renderer: InstanceType<typeof THREE.WebGLRenderer> | null = null;
      let lenis: InstanceType<typeof Lenis> | null = null;

      // Lenis smooth scroll
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
      function raf(time: number) {
        if (destroyed || !lenis) {
          return;
        }

        lenis.raf(time);
        rafId = window.requestAnimationFrame(raf);
      }
      rafId = window.requestAnimationFrame(raf);
      removers.push(() => window.cancelAnimationFrame(rafId));

      // Custom Cursor
      const cursor = cursorRef.current;
      const follower = followerRef.current;
      if (cursor && follower) {
        const onMouseMove = (event: Event) => {
          const e = event as MouseEvent;
          gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
          gsap.to(follower, {
            x: e.clientX - 20,
            y: e.clientY - 20,
            duration: 0.3,
          });
        };
        addListener(document, "mousemove", onMouseMove);
        document
          .querySelectorAll("a, button, input, textarea, .skill-node")
          .forEach((el) => {
            const onEnter = () => {
              gsap.to(follower, {
                scale: 1.8,
                borderColor: "#d0bcff",
                duration: 0.3,
              });
              gsap.to(cursor, {
                scale: 1.5,
                backgroundColor: "#d0bcff",
                duration: 0.3,
              });
            };
            const onLeave = () => {
              gsap.to(follower, {
                scale: 1,
                borderColor: "#4d8eff",
                duration: 0.3,
              });
              gsap.to(cursor, {
                scale: 1,
                backgroundColor: "#4d8eff",
                duration: 0.3,
              });
            };
            el.addEventListener("mouseenter", onEnter);
            el.addEventListener("mouseleave", onLeave);
            removers.push(() => {
              el.removeEventListener("mouseenter", onEnter);
              el.removeEventListener("mouseleave", onLeave);
            });
          });
      }

      // Typewriter
      const subtitle =
        "Architecting the next generation of autonomous agents and neural interfaces.";
      function typeWriter(text: string, i: number) {
        if (destroyed) {
          return;
        }

        if (heroSubtitleRef.current && i < text.length) {
          heroSubtitleRef.current.innerHTML += text.charAt(i);
          schedule(() => typeWriter(text, i + 1), 35);
        }
      }

      // Terminal
      function initTerminal() {
        const content = terminalContentRef.current;
        if (!content) return;
        const commands = [
          {
            cmd: "whoami",
            output:
              "[SYSTEM]: ABHAY MUNJEWAR V2.0.4 - NEURAL SYSTEMS ARCHITECT",
          },
          {
            cmd: "list --skills",
            output:
              "[PYTHON, RAG, FASTAPI, REACT, TENSORFLOW, AGENTIC_WORKFLOWS]",
          },
          {
            cmd: "run portfolio.py",
            output:
              "[INITIALIZING INTERFACE... READY. Code is the infrastructure for evolution.]",
          },
        ];
        let index = 0;
        async function typeCommand() {
          if (destroyed || !content || index >= commands.length) return;
          const line = document.createElement("div");
          line.className = "flex gap-4 mb-2";
          line.innerHTML = `<span style="color:var(--neon-cyan)">➜</span><span style="color:var(--neon-blue)">~</span><span class="text-on-surface cmd-text"></span>`;
          content.appendChild(line);
          const textSpan = line.querySelector(".cmd-text") as HTMLElement;
          const cmd = commands[index].cmd;
          for (let i = 0; i < cmd.length; i++) {
            if (destroyed) {
              return;
            }

            textSpan.innerHTML += cmd[i];
            await new Promise((r) => setTimeout(r, 100));
          }
          const output = document.createElement("div");
          output.className = "text-on-surface-variant mb-4 leading-relaxed";
          output.style.opacity = "0";
          output.innerHTML = commands[index].output;
          content.appendChild(output);
          gsap.to(output, { opacity: 1, duration: 0.5, delay: 0.2 });
          index++;
          schedule(typeCommand, 1000);
          content.scrollTop = content.scrollHeight;
        }
        typeCommand();
      }

      function initHeroAnimations() {
        typeWriter(subtitle, 0);
        gsap.from("#hero h1", {
          opacity: 0,
          y: 50,
          duration: 1,
          ease: "power4.out",
          delay: 0.2,
        });
        gsap.from("#hero button", {
          opacity: 0,
          y: 20,
          duration: 0.8,
          stagger: 0.2,
          ease: "power3.out",
          delay: 0.8,
        });
        initTerminal();
      }

      // Loading Screen
      function runLoader() {
        let count = 0;
        const loaderEl = loaderRef.current;
        const loaderFill = loaderFillRef.current;
        const loaderPercent = loaderPercentRef.current;
        const loaderStatus = loaderStatusRef.current;
        if (!loaderEl || !loaderFill || !loaderPercent || !loaderStatus)
          return;

        const loaderTl = gsap.timeline({
          onComplete: () => {
            gsap.to(loaderEl, {
              opacity: 0,
              filter: "blur(20px)",
              scale: 1.1,
              duration: 0.8,
              ease: "power4.inOut",
              onComplete: () => {
                loaderEl.style.display = "none";
                initHeroAnimations();
              },
            });
          },
        });
        loaderTl.pause();

        progressInterval = window.setInterval(() => {
          if (destroyed) {
            if (progressInterval !== undefined) {
              window.clearInterval(progressInterval);
            }
            return;
          }

          count += Math.floor(Math.random() * 8) + 2;
          if (count >= 100) {
            count = 100;
            window.clearInterval(progressInterval);
            loaderTl.play();
          }
          loaderPercent.innerText = count + "%";
          loaderFill.style.strokeDashoffset = String(
            628 - (628 * count) / 100
          );
          if (count % 15 === 0) {
            loaderStatus.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;
          } else {
            loaderStatus.style.transform = "translate(0, 0)";
          }
        }, 120);
        removers.push(() => {
          if (progressInterval !== undefined) {
            window.clearInterval(progressInterval);
          }
        });
      }
      runLoader();

      // Three.js Robot
      const robotInit = () => {
        const container = robotCanvasRef.current;
        if (!container) return;
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
          45,
          container.clientWidth / container.clientHeight,
          0.1,
          1000
        );
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);
        removers.push(() => {
          if (renderer && container.contains(renderer.domElement)) {
            container.removeChild(renderer.domElement);
          }
          renderer?.dispose();
        });

        const robotGroup = new THREE.Group();
        scene.add(robotGroup);

        const mat = new THREE.MeshPhongMaterial({
          color: 0x1d2027,
          shininess: 100,
        });
        const head = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 1), mat);
        head.position.y = 1.2;
        robotGroup.add(head);

        const neck = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.3, 0.4),
          mat
        );
        neck.position.y = 0.4;
        robotGroup.add(neck);

        const torso = new THREE.Mesh(new THREE.BoxGeometry(2, 2.5, 0.8), mat);
        torso.position.y = -1;
        robotGroup.add(torso);

        const eyeGeom = new THREE.SphereGeometry(0.12, 16, 16);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0x4cd7f6 });
        const leftEye = new THREE.Mesh(eyeGeom, eyeMat);
        leftEye.position.set(-0.3, 1.4, 0.5);
        robotGroup.add(leftEye);
        const rightEye = new THREE.Mesh(eyeGeom, eyeMat);
        rightEye.position.set(0.3, 1.4, 0.5);
        robotGroup.add(rightEye);

        const partCount = 200;
        const partGeom = new THREE.BufferGeometry();
        const partPos = new Float32Array(partCount * 3);
        for (let i = 0; i < partCount * 3; i++)
          partPos[i] = (Math.random() - 0.5) * 15;
        partGeom.setAttribute(
          "position",
          new THREE.BufferAttribute(partPos, 3)
        );
        const partMat = new THREE.PointsMaterial({
          color: 0x4d8eff,
          size: 0.05,
          transparent: true,
          opacity: 0.6,
        });
        const particles = new THREE.Points(partGeom, partMat);
        scene.add(particles);

        const ringMat = new THREE.MeshBasicMaterial({
          color: 0x4d8eff,
          transparent: true,
          opacity: 0.2,
        });
        const ring1 = new THREE.Mesh(
          new THREE.TorusGeometry(3.5, 0.01, 16, 100),
          ringMat
        );
        ring1.rotation.x = Math.PI / 2;
        scene.add(ring1);
        const ring2 = new THREE.Mesh(
          new THREE.TorusGeometry(4.2, 0.005, 16, 100),
          ringMat
        );
        ring2.rotation.y = Math.PI / 4;
        scene.add(ring2);

        const light = new THREE.PointLight(0x4d8eff, 2, 50);
        light.position.set(5, 5, 5);
        scene.add(light);
        scene.add(new THREE.AmbientLight(0x404040, 1.5));
        camera.position.z = 8;
        camera.position.y = 0.5;

        let mouseX = 0,
          mouseY = 0,
          targetX = 0,
          targetY = 0;
        const onRobotMouseMove = (event: Event) => {
          const e = event as MouseEvent;
          mouseX = e.clientX / window.innerWidth - 0.5;
          mouseY = e.clientY / window.innerHeight - 0.5;
        };
        addListener(window, "mousemove", onRobotMouseMove);

        const animate = (time: number) => {
          if (destroyed) {
            return;
          }

          requestAnimationFrame(animate);
          targetX += (mouseX - targetX) * 0.05;
          targetY += (mouseY - targetY) * 0.05;
          robotGroup.rotation.y = targetX * 0.5;
          robotGroup.rotation.x = targetY * 0.3;
          robotGroup.position.y = Math.sin(time * 0.001) * 0.1;
          if (Math.random() > 0.995) {
            leftEye.scale.y = 0;
            rightEye.scale.y = 0;
            schedule(() => {
              if (destroyed) {
                return;
              }

              leftEye.scale.y = 1;
              rightEye.scale.y = 1;
            }, 100);
          }
          particles.rotation.y += 0.001;
          ring1.rotation.z += 0.005;
          ring2.rotation.x += 0.003;
          if (!renderer) {
            return;
          }

          renderer.render(scene, camera);
        };
        animate(0);

        const handleResize = () => {
          if (destroyed) {
            return;
          }

          if (!container || !renderer) return;
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        };
        addListener(window, "resize", handleResize);
      };
      robotInit();

      // SVG Orbit System
      const initOrbitSystem = () => {
        const innerNodes = document.querySelectorAll(
          "#inner-orbit-group .skill-node"
        );
        const outerNodes = document.querySelectorAll(
          "#outer-orbit-group .skill-node"
        );

        const animateOrbit = (
          nodes: NodeListOf<Element>,
          radius: number,
          duration: number,
          reverse = false
        ) => {
          nodes.forEach((node, i) => {
            const angleOffset = (i / nodes.length) * Math.PI * 2;
            const obj = { angle: angleOffset };
            gsap.to(obj, {
              angle: angleOffset + (reverse ? -Math.PI * 2 : Math.PI * 2),
              duration,
              repeat: -1,
              ease: "none",
              onUpdate: () => {
                const x = 400 + Math.cos(obj.angle) * radius;
                const y = 300 + Math.sin(obj.angle) * radius;
                const rect = node.querySelector("rect");
                const text = node.querySelector("text");
                if (rect && text) {
                  const w = parseFloat(rect.getAttribute("width") || "0");
                  const h = parseFloat(rect.getAttribute("height") || "0");
                  gsap.set(rect, { x: x - w / 2, y: y - h / 2 });
                  gsap.set(text, { x, y });
                }
              },
            });
          });
        };

        animateOrbit(innerNodes, 120, 20);
        animateOrbit(outerNodes, 200, 35, true);
      };
      initOrbitSystem();

      // Scroll progress bar
      const handleScroll = () => {
        const winScroll =
          document.body.scrollTop || document.documentElement.scrollTop;
        const height =
          document.documentElement.scrollHeight -
          document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        if (scrollBarRef.current)
          scrollBarRef.current.style.width = scrolled + "%";
      };
      addListener(window, "scroll", handleScroll);
      handleScroll();

      // Stats Counters
      const animateCounter = (
        el: HTMLElement,
        target: number
      ) => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 2.5,
          ease: "power3.out",
          onUpdate: () => {
            el.innerText = String(Math.round(obj.val));
          },
        });
      };

      [counterProjectsRef, counterHackathonsRef].forEach((ref) => {
        if (!ref.current) return;
        const el = ref.current;
        const target = parseInt(el.dataset.target || "0");
        ScrollTrigger.create({
          trigger: el,
          start: "top 85%",
          onEnter: () => animateCounter(el as HTMLElement, target),
        });
      });

      // Hover card parallax
      document.querySelectorAll<HTMLElement>(".hover-card").forEach((card) => {
        const onMove = (event: Event) => {
          const e = event as MouseEvent;
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;
          gsap.to(card, {
            rotationY: x * 10,
            rotationX: -y * 10,
            transformPerspective: 800,
            ease: "power1.out",
            duration: 0.4,
          });
        };
        const onLeave = () => {
          gsap.to(card, {
            rotationY: 0,
            rotationX: 0,
            duration: 0.6,
            ease: "elastic.out(1, 0.75)",
          });
        };
        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);
        removers.push(() => {
          card.removeEventListener("mousemove", onMove);
          card.removeEventListener("mouseleave", onLeave);
        });
      });

      cleanup = () => {
        destroyed = true;
        trackedTimeouts.splice(0).forEach((timeoutId) => {
          window.clearTimeout(timeoutId);
        });
        if (progressInterval !== undefined) {
          window.clearInterval(progressInterval);
        }
        removers.splice(0).forEach((remove) => remove());
        lenis?.destroy();
      };
    });

    return () => cleanup();
  }, []);

  return (
    <>
      {/* Custom Cursor */}
      <div ref={cursorRef} className="custom-cursor hidden md:block" id="cursor" />
      <div ref={followerRef} className="cursor-follower hidden md:block" id="follower" />

      {/* Loading Screen */}
      <div
        ref={loaderRef}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
        id="loader"
        style={{ backgroundColor: "var(--void)" }}
      >
        <div className="relative flex h-64 w-64 items-center justify-center">
          <svg className="h-full w-full -rotate-90">
            <circle
              className="text-primary/10"
              cx="128"
              cy="128"
              fill="transparent"
              r="100"
              stroke="currentColor"
              strokeWidth="2"
            />
            <circle
              ref={loaderFillRef}
              className="text-primary"
              cx="128"
              cy="128"
              fill="transparent"
              r="100"
              stroke="currentColor"
              strokeDasharray="628"
              strokeDashoffset="628"
              strokeLinecap="round"
              strokeWidth="2"
              style={{ transition: "stroke-dashoffset 0.1s linear" }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span
              ref={loaderStatusRef}
              className="glitch-text tracking-widest"
              style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "12px", letterSpacing: "0.1em", fontWeight: 600, color: "var(--neon-blue)" }}
            >
              SYSTEM INITIALIZING...
            </span>
            <span
              ref={loaderPercentRef}
              className="mt-2"
              style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "14px", color: "#c2c6d6" }}
            >
              0%
            </span>
          </div>
        </div>
      </div>

      {/* Side Navigation */}
      <nav className="group fixed left-0 top-0 z-50 flex h-full w-20 flex-col border-r py-8 transition-all duration-500 hover:w-64"
        style={{ backgroundColor: "rgba(25, 27, 35, 0.8)", backdropFilter: "blur(24px)", borderColor: "rgba(66, 71, 84, 0.2)" }}>
        <div className="mb-12 flex items-center px-6">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border" style={{ borderColor: "rgba(173, 198, 255, 0.5)" }}>
            <img
              alt="Abhay Avatar"
              className="h-full w-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrVtFGo-okpD6LGwBf5cY4FoaxpcgjWFkt-mlfFFHOzVWFCqXrPOIeBB-4E8FS2ktgSdi4nSpzBXnf0ZuUee-mWOVEyhFHas2YLTt16H5l0TEsuxUeKsLqNLKz7gH11xNwuKQQfdzMKaOXqyLzg0kNtdnZ7ucH_bYlXi_La6CcfQyhwnLd-_nCe7scDP3ieT0ccVP-eofwRD2oIJbrAlC8fKfl5qWvXT2GbWXlTgMManMHWKugmhvavSfSxgEQ5fsr1CUBefh-0sx6"
            />
          </div>
          <div className="ml-4 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <p style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "32px", lineHeight: "1.3", fontWeight: 600, color: "#adc6ff" }}>
              Abhay Munjewar
            </p>
            <p style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "12px", letterSpacing: "0.1em", color: "#c2c6d6" }}>
              AI Systems Architect
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-2">
          {[
            { href: "#hero", icon: "home", label: "Home", active: true },
            { href: "#terminal", icon: "code", label: "Terminal", active: false },
            { href: "#arsenal", icon: "cyclone", label: "Orbit", active: false },
            { href: "#projects", icon: "layers", label: "Builds", active: false },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center px-6 py-4 transition-all"
              style={{
                color: item.active ? "#adc6ff" : "#c2c6d6",
                backgroundColor: item.active ? "rgba(0, 158, 185, 0.2)" : "transparent",
                borderRight: item.active ? "2px solid #4cd7f6" : "2px solid transparent",
              }}
              onMouseEnter={e => { if (!item.active) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(50, 53, 60, 0.5)"; }}
              onMouseLeave={e => { if (!item.active) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; }}
            >
              <span className="material-symbols-outlined shrink-0">{item.icon}</span>
              <span className="ml-8 overflow-hidden whitespace-nowrap opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "12px", letterSpacing: "0.1em", fontWeight: 600 }}>
                {item.label}
              </span>
            </a>
          ))}
        </div>

        <div className="px-6 py-8">
          <button className="w-full overflow-hidden whitespace-nowrap rounded-full border py-3 transition-all"
            style={{ backgroundColor: "rgba(0, 158, 185, 0.1)", borderColor: "rgba(76, 215, 246, 0.3)", color: "#4cd7f6", fontFamily: "var(--font-jetbrains-mono)", fontSize: "12px", letterSpacing: "0.1em", fontWeight: 600 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#4cd7f6"; (e.currentTarget as HTMLElement).style.color = "#003640"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(0, 158, 185, 0.1)"; (e.currentTarget as HTMLElement).style.color = "#4cd7f6"; }}>
            DOWNLOAD.PDF
          </button>
        </div>
      </nav>

      {/* Scroll Progress Bar */}
      <div className="fixed top-0 left-0 z-[60] h-1 w-full">
        <div
          ref={scrollBarRef}
          className="h-full w-0"
          style={{ background: "linear-gradient(to right, #adc6ff, #4cd7f6)", boxShadow: "0 0 10px #4d8eff" }}
        />
      </div>

      <main className="ml-20">
        {/* ── Section 1: Hero ── */}
        <section className="relative flex h-screen items-center overflow-hidden px-6" id="hero">
          {/* Background grid */}
          <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <div className="absolute bottom-0 left-0 h-[307px] w-full" style={{ background: "linear-gradient(to top, #10131a, transparent)" }} />
            <div
              className="absolute bottom-0 h-[200px] w-full opacity-20"
              style={{
                backgroundImage: "linear-gradient(rgba(66,71,84,1) 1px, transparent 1px), linear-gradient(90deg, rgba(66,71,84,1) 1px, transparent 1px)",
                backgroundSize: "50px 50px",
                transform: "rotateX(60deg) scale(2)",
              }}
            />
          </div>

          <div className="relative z-10 mx-auto grid w-full max-w-[1280px] grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border px-4 py-2"
                style={{ borderColor: "rgba(173, 198, 255, 0.3)", backgroundColor: "rgba(173, 198, 255, 0.1)", backdropFilter: "blur(12px)" }}>
                <span className="mr-3 h-2 w-2 animate-pulse rounded-full" style={{ backgroundColor: "#adc6ff" }} />
                <span style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "14px", color: "#adc6ff", letterSpacing: "0.05em" }}>
                  Status: Online
                </span>
              </div>

              <h1 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "72px", lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: 700, color: "#e1e2ec" }}>
                Building{" "}
                <span style={{ color: "#adc6ff", fontStyle: "italic" }}>Intelligent</span>{" "}
                Systems for the Future
              </h1>

              <p ref={heroSubtitleRef} className="max-w-xl"
                style={{ fontFamily: "var(--font-inter)", fontSize: "18px", lineHeight: "1.6", color: "#c2c6d6", minHeight: "1.6em" }} />

              <div className="flex gap-4 pt-4">
                <button
                  className="rounded-full px-8 py-4 transition-transform hover:scale-105"
                  style={{ backgroundColor: "#adc6ff", color: "#002e6a", fontFamily: "var(--font-jetbrains-mono)", fontSize: "12px", letterSpacing: "0.1em", fontWeight: 600, boxShadow: "0 0 20px rgba(77,142,255,0.3)" }}
                >
                  INITIATE PROJECT
                </button>
                <button
                  className="rounded-full border px-8 py-4 transition-all hover:bg-surface-variant/20"
                  style={{ borderColor: "#424754", fontFamily: "var(--font-jetbrains-mono)", fontSize: "12px", letterSpacing: "0.1em", fontWeight: 600, color: "#e1e2ec" }}
                >
                  VIEW ARSENAL
                </button>
              </div>
            </div>

            {/* Three.js Canvas */}
            <div className="relative flex h-[600px] items-center justify-center">
              <div className="orb-gradient absolute h-[400px] w-[400px]" />
              <div ref={robotCanvasRef} className="h-full w-full cursor-grab active:cursor-grabbing" id="robot-canvas" />
            </div>
          </div>
        </section>

        {/* ── Section 2: About ── */}
        <section className="mx-auto max-w-[1280px] px-6" style={{ paddingTop: "160px", paddingBottom: "160px" }}>
          <div className="grid grid-cols-1 items-center gap-24 md:grid-cols-2">
            <div className="relative">
              <div className="absolute -left-12 -top-12 h-32 w-32 border-l-2 border-t-2" style={{ borderColor: "rgba(173, 198, 255, 0.3)" }} />
              <div className="absolute -bottom-12 -right-12 h-32 w-32 border-b-2 border-r-2" style={{ borderColor: "rgba(76, 215, 246, 0.3)" }} />
              <h2 className="mb-8" style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "48px", lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: 700, color: "#e1e2ec" }}>
                Architecting the <br />
                <span style={{ color: "#4cd7f6" }}>Synthesized Future.</span>
              </h2>
              <p className="mb-12" style={{ fontFamily: "var(--font-inter)", fontSize: "18px", lineHeight: "1.6", color: "#c2c6d6" }}>
                I specialize in creating high-performance AI systems that bridge the gap between human intuition and machine precision. My work focuses on autonomous agents, scalable FastAPI backends, and deeply immersive user interfaces.
              </p>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p ref={counterProjectsRef} data-target="15" style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "48px", lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: 700, color: "#adc6ff" }}>0</p>
                  <p style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "12px", letterSpacing: "0.1em", fontWeight: 600, color: "#c2c6d6", textTransform: "uppercase" }}>Global Projects</p>
                </div>
                <div>
                  <p ref={counterHackathonsRef} data-target="5" style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "48px", lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: 700, color: "#4cd7f6" }}>0</p>
                  <p style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "12px", letterSpacing: "0.1em", fontWeight: 600, color: "#c2c6d6", textTransform: "uppercase" }}>Awards Won</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: "psychology", color: "#adc6ff", title: "Cognitive AI", desc: "Systems that learn, adapt, and predict user needs in real-time.", mt: true },
                { icon: "hub", color: "#4cd7f6", title: "Automation", desc: "Seamless agent workflows across heterogeneous environments.", mt: false },
                { icon: "memory", color: "#d0bcff", title: "Neural Networks", desc: "Deep learning architectures optimised for edge inference.", mt: true },
                { icon: "cloud_sync", color: "#adc6ff", title: "Cloud Scale", desc: "Distributed systems built for reliability and global reach.", mt: false },
              ].map((card) => (
                <div
                  key={card.title}
                  className="glass-panel hover-card rounded-xl p-8 transition-transform hover:-translate-y-2"
                  style={{ marginTop: card.mt ? "48px" : "0" }}
                >
                  <span className="material-symbols-outlined mb-4 block" style={{ color: card.color }}>{card.icon}</span>
                  <h4 className="mb-2" style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "32px", lineHeight: "1.3", fontWeight: 600 }}>{card.title}</h4>
                  <p style={{ fontFamily: "var(--font-inter)", fontSize: "16px", lineHeight: "1.5", color: "#c2c6d6" }}>{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Section 3: Technical Arsenal (Orbit) ── */}
        <section className="relative overflow-hidden" id="arsenal" style={{ paddingTop: "160px", paddingBottom: "160px", backgroundColor: "#0b0e15" }}>
          <div className="pointer-events-none absolute inset-0 opacity-10" style={{ background: "radial-gradient(circle at center, var(--neon-blue) 0%, transparent 50%)" }} />
          <div className="mx-auto mb-16 max-w-[1280px] px-6 text-center">
            <span className="mb-4 block tracking-widest uppercase" style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "14px", color: "#4cd7f6" }}>Core Competencies</span>
            <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "48px", lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: 700, color: "#e1e2ec" }}>The Neural Arsenal</h2>
          </div>

          <div className="orbit-container relative flex h-[600px] items-center justify-center">
            <svg className="h-full w-full" id="orbit-svg" style={{ maxWidth: "800px", maxHeight: "600px" }} viewBox="0 0 800 600">
              <defs>
                <radialGradient id="coreGradient">
                  <stop offset="0%" stopColor="rgba(77,142,255,0.4)" />
                  <stop offset="100%" stopColor="rgba(16,19,26,0.8)" />
                </radialGradient>
              </defs>
              {/* Center Core */}
              <g id="core">
                <circle className="animate-pulse" cx="400" cy="300" fill="url(#coreGradient)" r="60" stroke="var(--neon-blue)" strokeWidth="1" />
                <text fill="var(--neon-blue)" fontFamily="Space Grotesk" fontSize="18" fontWeight="700" textAnchor="middle" x="400" y="305">ABHAY</text>
              </g>
              {/* Inner orbit ring */}
              <circle cx="400" cy="300" fill="none" r="120" stroke="rgba(66,71,84,0.2)" strokeDasharray="4,4" strokeWidth="1" />
              <g id="inner-orbit-group">
                {["Python", "AI Agents"].map((skill) => (
                  <g key={skill} className="skill-node" data-skill={skill}>
                    <rect fill="rgba(29,32,39,0.9)" height="30" rx="15" stroke="rgba(76,215,246,0.3)" width={skill.length * 7 + 20} />
                    <text dominantBaseline="middle" fill="#e1e2ec" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle">{skill}</text>
                  </g>
                ))}
              </g>
              {/* Outer orbit ring */}
              <circle cx="400" cy="300" fill="none" r="200" stroke="rgba(66,71,84,0.15)" strokeWidth="1" />
              <g id="outer-orbit-group">
                {["FastAPI", "React", "TensorFlow", "Docker"].map((skill) => (
                  <g key={skill} className="skill-node" data-skill={skill}>
                    <rect fill="rgba(29,32,39,0.9)" height="30" rx="15" stroke="rgba(77,142,255,0.3)" width={skill.length * 7 + 20} />
                    <text dominantBaseline="middle" fill="#e1e2ec" fontFamily="JetBrains Mono" fontSize="10" textAnchor="middle">{skill}</text>
                  </g>
                ))}
              </g>
            </svg>
          </div>
        </section>

        {/* ── Section 4: Projects ── */}
        <section className="mx-auto max-w-[1280px] px-6" id="projects" style={{ paddingTop: "160px", paddingBottom: "160px" }}>
          <div className="mb-16 flex flex-col items-end justify-between gap-8 md:flex-row">
            <div>
              <span className="mb-4 block tracking-widest uppercase" style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "14px", color: "#adc6ff" }}>Active Deployments</span>
              <h2 style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "48px", lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: 700, color: "#e1e2ec" }}>Synthesized Systems</h2>
            </div>
            <button className="border-b pb-2 transition-colors" style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "12px", letterSpacing: "0.1em", fontWeight: 600, color: "#adc6ff", borderColor: "#adc6ff" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#4cd7f6"; (e.currentTarget as HTMLElement).style.borderColor = "#4cd7f6"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#adc6ff"; (e.currentTarget as HTMLElement).style.borderColor = "#adc6ff"; }}>
              VIEW ALL ARCHIVES
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
            {/* Featured project */}
            <div className="group hover-card relative h-[500px] cursor-pointer overflow-hidden rounded-2xl md:col-span-8 glass-panel">
              <img
                alt="Financial Research Agent"
                className="absolute inset-0 h-full w-full object-cover opacity-50 transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbxOk_gzkBREFUFJWH5LZA6qx2UW3IYaK481v2epD2z9hF84MajCghqtdQnwL8FiKzVI9UAqblmRs0uv3CICUL23qAuNzuZ-wmiizbCghqpvBxFfYGRGAxw74iSRX9lyMztv9pYKlGtlPNcevVgze9pFQ9Jw5W9Pqf2BcpNMDej6dbhjs1ZBKV5VttFt1X4fYWg6JuB43nbRVq0Y6OpFudqlgDERnqJwamZgAmBL5G-A_7bxmx_VX93aQWH04A9DOV9-ZOP2YhaYP_"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #10131a, rgba(16,19,26,0.6), transparent)" }} />
              <div className="absolute bottom-0 left-0 w-full p-10">
                <div className="mb-4 flex gap-2">
                  <span className="rounded-full border px-3 py-1 uppercase" style={{ backgroundColor: "rgba(173,198,255,0.2)", borderColor: "rgba(173,198,255,0.3)", fontFamily: "var(--font-jetbrains-mono)", fontSize: "14px", color: "#adc6ff" }}>Autonomous</span>
                  <span className="rounded-full border px-3 py-1 uppercase" style={{ backgroundColor: "rgba(208,188,255,0.2)", borderColor: "rgba(208,188,255,0.3)", fontFamily: "var(--font-jetbrains-mono)", fontSize: "14px", color: "#d0bcff" }}>LLM</span>
                </div>
                <h3 className="mb-4" style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "48px", lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: 700, color: "#e1e2ec" }}>Financial Research Agent</h3>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: "16px", lineHeight: "1.5", color: "#c2c6d6", maxWidth: "568px" }}>
                  Deep integration of RAG pipelines for real-time market sentiment analysis and portfolio optimization.
                </p>
              </div>
            </div>

            <div className="group hover-card relative h-[500px] cursor-pointer overflow-hidden rounded-2xl md:col-span-4 glass-panel">
              <img
                alt="Sentient Care Bot"
                className="absolute inset-0 h-full w-full object-cover opacity-40 transition-transform duration-700 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB05JM7EzgRFAvRzGYJm19CBfDMlG254dEENlau_gzIyf7dUDaYF8RyAZwYFMU013OaB3eA2bQBlYFSk771AnJ9bgQjKPcyUIanD6PPHURJU0x72Ikmy0pl8nv8dtWptXXC-c3SR1o53-EdBQRVDZ2XSmnAjYEAzcwyuBZ5wLYXZZSV3Z1x4YF1BaAiBSCuoPYTiB55LdYo-ST_Kwxbz8V2n7yD_RKTENHGmgSay3X0yVZlmhRp1DabwfeES0ga1Wl86EpLfEtYhkHg"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #10131a, transparent, transparent)" }} />
              <div className="absolute bottom-0 left-0 p-10">
                <div className="mb-4">
                  <span className="rounded-full border px-3 py-1 uppercase" style={{ backgroundColor: "rgba(76,215,246,0.2)", borderColor: "rgba(76,215,246,0.3)", fontFamily: "var(--font-jetbrains-mono)", fontSize: "14px", color: "#4cd7f6" }}>NLP</span>
                </div>
                <h3 className="mb-4" style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "32px", lineHeight: "1.3", fontWeight: 600, color: "#e1e2ec" }}>Sentient Care Bot</h3>
                <p style={{ fontFamily: "var(--font-inter)", fontSize: "16px", lineHeight: "1.5", color: "#c2c6d6" }}>Emotionally aware customer support interface utilizing advanced semantic analysis.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Section 5: Terminal ── */}
        <section className="mx-auto max-w-[1280px] px-6" id="terminal" style={{ paddingTop: "160px", paddingBottom: "160px" }}>
          <div className="overflow-hidden rounded-xl shadow-2xl glass-panel" style={{ borderColor: "rgba(66, 71, 84, 0.3)" }}>
            {/* Terminal header */}
            <div className="flex items-center justify-between border-b px-6 py-3" style={{ backgroundColor: "#272a31", borderColor: "rgba(66, 71, 84, 0.2)" }}>
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500/50" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/50" />
                <div className="h-3 w-3 rounded-full bg-green-500/50" />
              </div>
              <div style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "14px", color: "#c2c6d6", opacity: 0.5 }}>abhay@system: ~/portfolio</div>
              <span className="material-symbols-outlined text-sm" style={{ color: "#c2c6d6" }}>terminal</span>
            </div>
            <div
              ref={terminalContentRef}
              className="terminal-scroll overflow-y-auto p-8"
              id="terminal-content"
              style={{ height: "400px", fontFamily: "var(--font-jetbrains-mono)", fontSize: "14px", backgroundColor: "rgba(11, 14, 21, 0.9)" }}
            />
          </div>
        </section>

        {/* ── Section 6: Contact ── */}
        <section className="relative overflow-hidden px-6" style={{ paddingTop: "160px", paddingBottom: "160px" }}>
          <div className="orb-gradient absolute -bottom-64 -right-64 h-[600px] w-[600px] opacity-20" />
          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <h2 className="mb-8" style={{ fontFamily: "var(--font-space-grotesk)", fontSize: "72px", lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: 700, color: "#e1e2ec" }}>
              Let&apos;s build the{" "}
              <span style={{ color: "#adc6ff", fontStyle: "italic" }}>future</span>{" "}
              together.
            </h2>
            <div className="glass-panel rounded-3xl p-10 text-left">
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="ml-1 block uppercase tracking-widest" style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "12px", letterSpacing: "0.1em", fontWeight: 600, color: "#c2c6d6" }}>Identity</label>
                    <input
                      type="text"
                      placeholder="Your Name"
                      className="w-full rounded-xl border px-6 py-4 outline-none transition-all"
                      style={{ backgroundColor: "#0b0e15", borderColor: "#424754", color: "#e1e2ec", fontFamily: "var(--font-inter)" }}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="ml-1 block uppercase tracking-widest" style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "12px", letterSpacing: "0.1em", fontWeight: 600, color: "#c2c6d6" }}>Frequency</label>
                    <input
                      type="email"
                      placeholder="email@address.com"
                      className="w-full rounded-xl border px-6 py-4 outline-none transition-all"
                      style={{ backgroundColor: "#0b0e15", borderColor: "#424754", color: "#e1e2ec", fontFamily: "var(--font-inter)" }}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="ml-1 block uppercase tracking-widest" style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "12px", letterSpacing: "0.1em", fontWeight: 600, color: "#c2c6d6" }}>Message</label>
                  <textarea
                    rows={4}
                    placeholder="Briefly describe your vision..."
                    className="w-full rounded-xl border px-6 py-4 outline-none transition-all resize-none"
                    style={{ backgroundColor: "#0b0e15", borderColor: "#424754", color: "#e1e2ec", fontFamily: "var(--font-inter)" }}
                  />
                </div>
                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-4 rounded-xl py-5 transition-all"
                  style={{ backgroundColor: "#adc6ff", color: "#002e6a", fontFamily: "var(--font-jetbrains-mono)", fontSize: "12px", letterSpacing: "0.1em", fontWeight: 600 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#4d8eff"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = "#adc6ff"; }}
                >
                  TRANSMIT SIGNAL
                  <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">send</span>
                </button>
              </form>
            </div>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="w-full border-t py-12" style={{ backgroundColor: "#0b0e15", borderColor: "rgba(66, 71, 84, 0.1)" }}>
          <div className="mx-auto flex max-w-[1280px] flex-col items-center justify-between gap-8 px-6 md:flex-row">
            <div className="flex flex-col items-center md:items-start">
              <span className="mb-2 tracking-widest" style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "14px", color: "#adc6ff" }}>ABHAY.AI</span>
              <p style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "14px", color: "#c2c6d6" }}>© 2025 ABHAY MUNJEWAR. SYSTEM_READY</p>
            </div>
            <div className="flex gap-8">
              {["Github", "LinkedIn", "Twitter", "Docs"].map((link) => (
                <a key={link} href="#" style={{ fontFamily: "var(--font-jetbrains-mono)", fontSize: "14px", color: "#c2c6d6", textDecoration: "none" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#4cd7f6"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#c2c6d6"; }}>
                  {link}
                </a>
              ))}
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}
