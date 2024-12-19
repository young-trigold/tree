/**
 * 正态分布概率
 * @return {number}
 */
function gaussianRandom() {
  let u = 0,
    v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return gaussianRandom(); // resample between 0 and 1
  return num;
}

interface Point {
  x: number;
  y: number;
}

import "./main.less";
import {
  type FunctionComponent,
  useState,
  useRef,
  CSSProperties,
  useEffect,
} from "react";
import { createRoot } from "react-dom/client";

interface TreeConfig {
  backgroundColor: string;
  branchColor: string;
  hasFlower: boolean;
  flowerColor: string;
  rootPosition: { x: number; y: number };
  mainBranchHeight: number;
  mainBranchThickness: number;
  angleDelta: number;
  branchLengthDecreaseRatio: number;
  branchThicknessDecreaseRatio: number;
  random: boolean;
}

const Tree: FunctionComponent<TreeConfig> = (props) => {
  const {
    backgroundColor,
    branchColor,
    hasFlower,
    flowerColor,
    rootPosition,
    mainBranchHeight,
    mainBranchThickness,
    angleDelta,
    branchLengthDecreaseRatio,
    branchThicknessDecreaseRatio,
    random,
  } = props;

  const intrinsicCanvasSize = {
    width: innerWidth * devicePixelRatio,
    height: innerHeight * devicePixelRatio,
  };

  const canvasStyle: CSSProperties = {
    display: "block",
    width: `${innerWidth}px`,
    height: `${innerHeight}px`,
  };

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.lineCap = "round";

    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.translate(canvas.width / 2, canvas.height);
    context.scale(1, -1);
    /**
     * 画树枝
     * @param startPoint 开始位置
     * @param angle 角度
     * @param length 长度
     * @param width 粗细
     * @param color 颜色
     * @returns {Point} 终点
     */
    const drawBranch = (
      startPoint: Point,
      angle: number,
      length: number,
      width: number,
      color: string
    ) => {
      context.beginPath();
      context.moveTo(startPoint.x, startPoint.y);
      const y = length * Math.sin(angle) + startPoint.y;
      const x = length * Math.cos(angle) + startPoint.x;
      const endPoint: Point = { x, y };
      context.lineTo(endPoint.x, endPoint.y);
      context.lineWidth = width;
      context.strokeStyle = color;
      context.stroke();
      return endPoint;
    };

    /**
     * 画树
     * @param rootPosition 树根位置
     * @param mainBranchHeight 主干高度
     * @param mainBranchThickness 主干粗细
     * @param angleDelta 角度变化值
     * @param branchLengthDecreaseRatio 树枝长度衰减比率
     * @param branchThicknessDecreaseRatio 树枝粗细度衰减比率
     * @param hasFlower 是否画花
     * @param random 添加随机性
     */
    const drawTreeWithMainBranch = (
      rootPosition: Point,
      mainBranchHeight: number,
      mainBranchThickness: number,
      angleDelta: number,
      branchLengthDecreaseRatio: number,
      branchThicknessDecreaseRatio: number,
      hasFlower: boolean,
      random: boolean
    ) => {
      // 主干
      const endPoint = drawBranch(
        rootPosition,
        Math.PI / 2,
        mainBranchHeight,
        mainBranchThickness,
        branchColor
      );

      /**
       * 画花
       * @param position 位置
       * @param size 大小
       * @param color 颜色
       */
      const drawFlower = (position: Point, size: number, color: string) => {
        context.beginPath();
        context.arc(position.x, position.y, size, 0, Math.PI * 2);
        context.fillStyle = color;
        context.fill();
      };

      const drawTree = (
        curPoint: Point,
        curAngle: number,
        curLength: number,
        curThickness: number
      ) => {
        // 树枝生长角度变为下方
        const back = curAngle < 0 || curAngle > Math.PI;
        // 树枝生长位置超出画布
        const beyond =
          Math.abs(curPoint.x) > canvas.width / 2 ||
          Math.abs(curPoint.y) > canvas.height;
        // 树枝太短
        const short = curLength < mainBranchHeight / 8;
        if (back || beyond || short) {
          // 顶端
          if (short) {
            // 画花
            if (hasFlower && Math.round(Math.random()))
              drawFlower(curPoint, 20 * gaussianRandom(), flowerColor);
          }
          return;
        }
        const leftAngle =
          curAngle + angleDelta * (random ? gaussianRandom() : 1);
        const rightAngle =
          curAngle - angleDelta * (random ? gaussianRandom() : 1);
        const nextLength = curLength * (1 - branchLengthDecreaseRatio);
        const nextThickness = curThickness * (1 - branchThicknessDecreaseRatio);

        setTimeout(() => {
          const left = drawBranch(
            curPoint,
            leftAngle,
            nextLength,
            nextThickness,
            branchColor
          );
          drawTree(left, leftAngle, nextLength, nextThickness);
          const right = drawBranch(
            curPoint,
            rightAngle,
            nextLength,
            nextThickness,
            branchColor
          );
          drawTree(right, rightAngle, nextLength, nextThickness);
        }, 1500);
      };

      drawTree(
        endPoint,
        Math.PI / 2,
        mainBranchHeight * 0.37,
        mainBranchThickness
      );
    };

    drawTreeWithMainBranch(
      rootPosition,
      mainBranchHeight,
      mainBranchThickness,
      angleDelta,
      branchLengthDecreaseRatio,
      branchThicknessDecreaseRatio,
      hasFlower,
      random
    );
    return () => {
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [
    backgroundColor,
    branchColor,
    hasFlower,
    flowerColor,
    rootPosition,
    mainBranchHeight,
    mainBranchThickness,
    angleDelta,
    branchLengthDecreaseRatio,
    branchThicknessDecreaseRatio,
    random,
  ]);

  return (
    <canvas
      ref={canvasRef}
      width={intrinsicCanvasSize.width}
      height={intrinsicCanvasSize.height}
      style={canvasStyle}
    ></canvas>
  );
};

const App = () => {
  const initialConfig: TreeConfig = {
    backgroundColor: "#ffffff",
    branchColor: "#1e2202",
    flowerColor: "#27b027",
    rootPosition: { x: ((innerWidth * devicePixelRatio) / 2) * 0.37, y: 30 },
    mainBranchHeight: innerHeight * devicePixelRatio * 0.3,
    mainBranchThickness: 100,
    angleDelta: Math.PI / 4,
    branchLengthDecreaseRatio: 0.1,
    branchThicknessDecreaseRatio: 0.3,
    hasFlower: true,
    random: true,
  };

  const [treeConfig, setTreeConfig] = useState<TreeConfig>(initialConfig);

  const [backgroundColor, setBackgroundColor] = useState(
    treeConfig.backgroundColor
  );

  const onBackgroundColorChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    console.debug("setBackgroundColor", event.target.value);
    setBackgroundColor(event.target.value);
  };

  const [branchColor, setBranchColor] = useState(treeConfig.branchColor);

  const onBranchColorChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    console.debug("setBranchColor", event.target.value);
    setBranchColor(event.target.value);
  };

  const [hasFlower, setHasFlower] = useState(treeConfig.hasFlower);

  const onHasFlowerChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setHasFlower(event.target.checked);
  };

  const [flowerColor, setFlowerColor] = useState(treeConfig.flowerColor);

  const onFlowerColorChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setFlowerColor(event.target.value);
  };

  const [rootPosition, setRootPosition] = useState(treeConfig.rootPosition);

  const onRootPositionXChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const x = Number(event.target.value);
    setRootPosition((preRootPosition) => ({ ...preRootPosition, x }));
  };

  const onRootPositionYChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const y = Number(event.target.value);
    setRootPosition((preRootPosition) => ({ ...preRootPosition, y }));
  };

  const [mainBranchHeight, setMainBranchHeight] = useState(
    treeConfig.mainBranchHeight
  );

  const onMainBranchHeightChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setMainBranchHeight(Number(event.target.value));
  };

  const [mainBranchThickness, setMainBranchThickness] = useState(
    treeConfig.mainBranchThickness
  );

  const onMainBranchThicknessChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (event) => {
    setMainBranchThickness(Number(event.target.value));
  };

  const [angleDelta, setAngleDelta] = useState(treeConfig.angleDelta);

  const onAngleDeltaChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setAngleDelta(Number(event.target.value));
  };

  const [branchLengthDecreaseRatio, setBranchLengthDecreaseRatio] = useState(
    treeConfig.branchLengthDecreaseRatio
  );

  const onBranchLengthDecreaseRatioChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (event) => {
    setBranchLengthDecreaseRatio(Number(event.target.value));
  };

  const [branchThicknessDecreaseRatio, setBranchThicknessDecreaseRatio] =
    useState(treeConfig.branchThicknessDecreaseRatio);

  const onBranchThicknessDecreaseRatioChange: React.ChangeEventHandler<
    HTMLInputElement
  > = (event) => {
    setBranchThicknessDecreaseRatio(Number(event.target.value));
  };

  const [random, setRandom] = useState(treeConfig.random);

  const onRandomChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    setRandom(event.target.checked);
  };

  const onSubmit: React.MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    const newTreeConfig: TreeConfig = {
      backgroundColor,
      branchColor,
      flowerColor,
      rootPosition,
      mainBranchHeight,
      mainBranchThickness,
      angleDelta,
      branchLengthDecreaseRatio,
      branchThicknessDecreaseRatio,
      hasFlower,
      random,
    };
    setTreeConfig(newTreeConfig);
  };

  const [formStyle, setFormStyle] = useState<CSSProperties>({
    overflow: "hidden",
    transition: "all 0.3s ease-in",
  });

  const [flag, setFlag] = useState(false);

  const onClose: React.MouseEventHandler<HTMLButtonElement> = () => {
    setFlag((preFlag) => !preFlag);
    setFormStyle((preFormStyle) => ({
      ...preFormStyle,
      width: flag ? "unset" : 0,
      height: flag ? "unset" : 0,
      padding: flag ? "1em" : "unset",
    }));
  };

  const onReset: React.MouseEventHandler<HTMLButtonElement> = () => {
    setBackgroundColor(initialConfig.backgroundColor);
    setBranchColor(initialConfig.branchColor);
    setHasFlower(initialConfig.hasFlower);
    setFlowerColor(initialConfig.flowerColor);
    setRootPosition(initialConfig.rootPosition);
    setAngleDelta(initialConfig.angleDelta);
    setBranchLengthDecreaseRatio(initialConfig.branchLengthDecreaseRatio);
    setBranchThicknessDecreaseRatio(initialConfig.branchThicknessDecreaseRatio);
    setMainBranchHeight(initialConfig.mainBranchHeight);
    setMainBranchThickness(initialConfig.mainBranchThickness);
    setRandom(initialConfig.random);
    setTreeConfig(initialConfig);
  };

  return (
    <>
      <Tree {...treeConfig}></Tree>
      <div className="formContainer">
        <form className="form" style={formStyle}>
          <div className="field">
            <label htmlFor="backgroundColor">背景颜色</label>
            <input
              value={backgroundColor}
              onChange={onBackgroundColorChange}
              type="color"
              id="backgroundColor"
            />
          </div>
          <div className="field">
            <label htmlFor="branchColor">树枝的颜色</label>
            <input
              value={branchColor}
              onChange={onBranchColorChange}
              type="color"
              id="branchColor"
            />
          </div>
          <div className="field">
            <input
              checked={hasFlower}
              onChange={onHasFlowerChange}
              type="checkbox"
              id="hasFlower"
            />
            <label htmlFor="hasFlower">需要画花</label>
          </div>
          {hasFlower ? (
            <div className="field">
              <label htmlFor="flowerColor">花的颜色</label>
              <input
                value={flowerColor}
                onChange={onFlowerColorChange}
                type="color"
                id="flowerColor"
              />
            </div>
          ) : null}
          <div className="field">
            <label htmlFor="rootPosition">
              树根的位置（x, y），原点在屏幕正下
            </label>
            <input
              min={(-innerWidth / 2) * devicePixelRatio}
              max={(innerWidth / 2) * devicePixelRatio}
              value={rootPosition.x}
              onChange={onRootPositionXChange}
              type="number"
            />
            <input
              min={0}
              max={innerHeight * devicePixelRatio}
              value={rootPosition.y}
              onChange={onRootPositionYChange}
              type="number"
            />
          </div>
          <div className="field">
            <label htmlFor="mainBranchHeight">主干的高度</label>
            <input
              min={0}
              max={innerHeight * devicePixelRatio}
              value={mainBranchHeight}
              onChange={onMainBranchHeightChange}
              type="number"
              id="mainBrachHeight"
            />
          </div>
          <div className="field">
            <label htmlFor="mainBranchThickness">主干的粗细</label>
            <input
              min={0}
              max={innerHeight * devicePixelRatio}
              value={mainBranchThickness}
              onChange={onMainBranchThicknessChange}
              type="number"
              id="mainBranchThickness"
            />
          </div>
          <div className="field">
            <label htmlFor="angleDelta">
              每次画树枝角度变化值（0 ~ PI / 2）
            </label>
            <input
              value={angleDelta}
              onChange={onAngleDeltaChange}
              type="number"
              id="angleDelta"
            />
          </div>
          <div className="field">
            <label htmlFor="branchLengthDecreaseRatio">
              每次画树枝长度衰减比率（0~1）
            </label>
            <input
              style={{ width: "100px" }}
              min={0}
              max={1}
              value={branchLengthDecreaseRatio}
              onChange={onBranchLengthDecreaseRatioChange}
              type="number"
              id="branchLengthDecreaseRatio"
            />
          </div>
          <div className="field">
            <label htmlFor="branchThicknessDecreaseRatio">
              每次画树枝粗细度衰减比率（0～1）
            </label>
            <input
              style={{ width: "100px" }}
              min={0}
              max={1}
              value={branchThicknessDecreaseRatio}
              onChange={onBranchThicknessDecreaseRatioChange}
              type="number"
              id="branchThicknessDecreaseRatio"
            />
          </div>
          <div className="field">
            <input
              checked={random}
              onChange={onRandomChange}
              type="checkbox"
              id="random"
            />
            <label htmlFor="random">添加随机性</label>
          </div>
          <div className="field">
            <button onClick={onSubmit} className="submit-button" type="submit">
              提交
            </button>
            <button
              style={{ marginLeft: "24px" }}
              onClick={onReset}
              className="reset-button"
              type="button"
            >
              重置
            </button>
          </div>
        </form>
        <button className="cancel-button" type="button" onClick={onClose}>
          {flag ? "打开" : "关闭"}
        </button>
      </div>
    </>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
