"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import { ArrowRight, Link } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ShadcnButton } from "@/components/ui/shadcn-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ElementType;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
  price?: number;
  purchased?: boolean;
  onPurchase?: () => void;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
}

// ── Ring configuration ────────────────────────────────────────────────
const RINGS = [
  { radius: 140, speed: 0.20, direction:  1, border: "border-white/20", nodeSize: 36 },
  { radius: 240, speed: 0.12, direction: -1, border: "border-white/12", nodeSize: 40 },
  { radius: 330, speed: 0.08, direction:  1, border: "border-white/8",  nodeSize: 44 },
];

function truncateTitle(title: string, max = 28): string {
  return title.length > max ? title.slice(0, max - 1) + "…" : title;
}

export default function RadialOrbitalTimeline({
  timelineData,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [ringAngles, setRingAngles] = useState<number[]>([0, 0, 0]);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // ── Distribute items across rings ────────────────────────────────────
  const ringItems = useMemo(() => {
    const n = timelineData.length;
    if (n === 0) return [[], [], []] as TimelineItem[][];

    const innerCount = Math.ceil(n / 3);
    const middleCount = Math.ceil((n - innerCount) / 2);

    return [
      timelineData.slice(0, innerCount),
      timelineData.slice(innerCount, innerCount + middleCount),
      timelineData.slice(innerCount + middleCount),
    ];
  }, [timelineData]);

  // ── Map item id → { ringIndex, indexInRing } ────────────────────────
  const itemRingMap = useMemo(() => {
    const map: Record<number, { ringIndex: number; indexInRing: number }> = {};
    ringItems.forEach((items, ringIndex) => {
      items.forEach((item, indexInRing) => {
        map[item.id] = { ringIndex, indexInRing };
      });
    });
    return map;
  }, [ringItems]);

  // ── Auto-rotation timer ──────────────────────────────────────────────
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (autoRotate) {
      timer = setInterval(() => {
        setRingAngles((prev) =>
          prev.map((angle, i) => {
            const newAngle = (angle + RINGS[i].speed * RINGS[i].direction) % 360;
            return Number(newAngle.toFixed(3));
          })
        );
      }, 50);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [autoRotate]);

  // ── Click empty space → reset ────────────────────────────────────────
  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  // ── Toggle node ──────────────────────────────────────────────────────
  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState: Record<number, boolean> = {};
      Object.keys(prev).forEach((key) => {
        if (parseInt(key) !== id) newState[parseInt(key)] = false;
      });
      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulse: Record<number, boolean> = {};
        relatedItems.forEach((relId) => { newPulse[relId] = true; });
        setPulseEffect(newPulse);

        centerViewOnNode(id);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  // ── Center view on a specific node ───────────────────────────────────
  const centerViewOnNode = (nodeId: number) => {
    const info = itemRingMap[nodeId];
    if (!info) return;

    const { ringIndex, indexInRing } = info;
    const totalInRing = ringItems[ringIndex].length;
    const targetAngle = (indexInRing / totalInRing) * 360;
    const desiredAngle = 270 - targetAngle;

    setRingAngles((prev) => {
      const next = [...prev];
      next[ringIndex] = desiredAngle;
      return next;
    });
  };

  // ── Calculate position for a node ────────────────────────────────────
  const calculateNodePosition = (
    indexInRing: number,
    totalInRing: number,
    ringIndex: number,
  ) => {
    const ring = RINGS[ringIndex];
    const angle = ((indexInRing / totalInRing) * 360 + ringAngles[ringIndex]) % 360;
    const radian = (angle * Math.PI) / 180;

    const x = ring.radius * Math.cos(radian);
    const y = ring.radius * Math.sin(radian);

    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.4, Math.min(1, 0.4 + 0.6 * ((1 + Math.sin(radian)) / 2)));

    return { x, y, zIndex, opacity, angleDeg: angle, radian };
  };

  // ── Helpers ──────────────────────────────────────────────────────────
  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    return getRelatedItems(activeNodeId).includes(itemId);
  };

  const getStatusStyles = (status: TimelineItem["status"]): string => {
    switch (status) {
      case "completed":
        return "text-white bg-black border-white";
      case "in-progress":
        return "text-black bg-white border-black";
      case "pending":
        return "text-white bg-black/40 border-white/50";
      default:
        return "text-white bg-black/40 border-white/50";
    }
  };

  // ── Compute label placement so it radiates outward from center ───────
  const getLabelStyle = (radian: number, ringIndex: number) => {
    const offset = RINGS[ringIndex].nodeSize / 2 + 8;
    const lx = Math.cos(radian) * offset;
    const ly = Math.sin(radian) * offset;

    const angleDeg = (radian * 180) / Math.PI;
    const isRight = angleDeg >= -90 && angleDeg < 90;
    const textAlign = isRight ? "left" : "right";
    const translateX = isRight ? "0%" : "-100%";

    return {
      position: "absolute" as const,
      left: `calc(50% + ${lx}px)`,
      top: `calc(50% + ${ly}px)`,
      transform: `translate(${translateX}, -50%)`,
      textAlign: textAlign as "left" | "right",
    };
  };

  return (
    <div
      className="w-full h-[600px] md:h-[700px] flex flex-col items-center justify-center bg-black overflow-hidden rounded-2xl"
      ref={containerRef}
      onClick={handleContainerClick}
    >
      <div className="relative w-full max-w-4xl h-full flex items-center justify-center">
        <div
          className="absolute w-full h-full flex items-center justify-center"
          ref={orbitRef}
          style={{ perspective: "1000px" }}
        >
          {/* ── Center orb ──────────────────────────────────────────── */}
          <div className="absolute w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-teal-500 animate-pulse flex items-center justify-center z-10">
            <div className="absolute w-20 h-20 rounded-full border border-white/20 animate-ping opacity-70"></div>
            <div
              className="absolute w-24 h-24 rounded-full border border-white/10 animate-ping opacity-50"
              style={{ animationDelay: "0.5s" }}
            ></div>
            <div className="w-8 h-8 rounded-full bg-white/80 backdrop-blur-md"></div>
          </div>

          {/* ── Orbit rings (visible circles) ───────────────────────── */}
          {RINGS.map((ring, i) => (
            <div
              key={`ring-${i}`}
              className={`absolute rounded-full border ${ring.border}`}
              style={{
                width: ring.radius * 2,
                height: ring.radius * 2,
              }}
            />
          ))}

          {/* ── Nodes per ring ──────────────────────────────────────── */}
          {ringItems.map((items, ringIndex) =>
            items.map((item, indexInRing) => {
              const position = calculateNodePosition(indexInRing, items.length, ringIndex);
              const isExpanded = expandedItems[item.id];
              const isRelated = isRelatedToActive(item.id);
              const isPulsing = pulseEffect[item.id];
              const Icon = item.icon;
              const nodeSize = RINGS[ringIndex].nodeSize;

              const nodeStyle = {
                transform: `translate(${position.x}px, ${position.y}px)`,
                zIndex: isExpanded ? 200 : position.zIndex,
                opacity: isExpanded ? 1 : position.opacity,
              };

              const labelStyle = getLabelStyle(position.radian, ringIndex);

              return (
                <div
                  key={item.id}
                  ref={(el) => { nodeRefs.current[item.id] = el; }}
                  className="absolute transition-all duration-700 cursor-pointer"
                  style={nodeStyle}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItem(item.id);
                  }}
                >
                  {/* Energy glow */}
                  <div
                    className={`absolute rounded-full -inset-1 ${isPulsing ? "animate-pulse duration-1000" : ""}`}
                    style={{
                      background: `radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 70%)`,
                      width: `${item.energy * 0.5 + nodeSize}px`,
                      height: `${item.energy * 0.5 + nodeSize}px`,
                      left: `-${(item.energy * 0.5 + nodeSize - nodeSize) / 2}px`,
                      top: `-${(item.energy * 0.5 + nodeSize - nodeSize) / 2}px`,
                    }}
                  ></div>

                  {/* Node circle */}
                  <div
                    className={`
                      rounded-full flex items-center justify-center
                      ${isExpanded ? "bg-white text-black" : isRelated ? "bg-white/50 text-black" : "bg-black text-white"}
                      border-2
                      ${isExpanded ? "border-white shadow-lg shadow-white/30" : isRelated ? "border-white animate-pulse" : "border-white/40"}
                      transition-all duration-300 transform
                      ${isExpanded ? "scale-150" : ""}
                    `}
                    style={{ width: nodeSize, height: nodeSize }}
                  >
                    <Icon size={nodeSize * 0.4} />
                  </div>

                  {/* Title label — positioned radially outward with dark pill */}
                  <div style={labelStyle}>
                    <span
                      className={`
                        inline-block whitespace-nowrap
                        text-[13px] font-semibold tracking-wide
                        bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-md
                        transition-all duration-300
                        ${isExpanded ? "text-white bg-white/20" : "text-white/80"}
                      `}
                    >
                      {truncateTitle(item.title)}
                    </span>
                  </div>

                  {/* Expanded card */}
                  {isExpanded && (
                    <Card className="absolute top-20 left-1/2 -translate-x-1/2 w-72 bg-black/90 backdrop-blur-lg border-white/30 shadow-xl shadow-white/10 overflow-visible">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-px h-3 bg-white/50"></div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                          <Badge className={`px-2 text-xs ${getStatusStyles(item.status)}`}>
                            {item.status === "completed" ? "AVAILABLE" : item.status === "in-progress" ? "NEW" : "COMING SOON"}
                          </Badge>
                          <span className="text-xs font-mono text-white/50">{item.date}</span>
                        </div>
                        <CardTitle className="text-sm mt-2 text-white">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="text-xs text-white/80">
                        <p>{item.content}</p>

                        {item.price !== undefined && (
                          <div className="mt-4 pt-3 border-t border-white/10">
                            <ShadcnButton
                              variant="outline"
                              size="sm"
                              className="w-full rounded-full border-white/30 bg-white text-black hover:bg-white/90 hover:text-black font-semibold text-sm cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                item.onPurchase?.();
                              }}
                            >
                              {item.purchased ? "View Guide →" : item.price === 0 ? "Free — View Guide" : `Unlock for $${item.price.toFixed(2)}`}
                            </ShadcnButton>
                          </div>
                        )}

                        <div className="mt-3 pt-3 border-t border-white/10">
                          <span className="inline-block text-[10px] font-medium tracking-wider text-white/50 uppercase">
                            {item.category}
                          </span>
                        </div>

                        {item.relatedIds.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <div className="flex items-center mb-2">
                              <Link size={10} className="text-white/70 mr-1" />
                              <h4 className="text-xs uppercase tracking-wider font-medium text-white/70">
                                Related Guides
                              </h4>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {item.relatedIds.map((relatedId) => {
                                const relatedItem = timelineData.find((i) => i.id === relatedId);
                                return (
                                  <ShadcnButton
                                    key={relatedId}
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center h-6 px-2 py-0 text-xs rounded-none border-white/20 bg-transparent hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleItem(relatedId);
                                    }}
                                  >
                                    {relatedItem?.title}
                                    <ArrowRight size={8} className="ml-1 text-white/60" />
                                  </ShadcnButton>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
