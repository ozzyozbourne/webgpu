import "./style.css";
async function initWebGPU(): Promise<{
  adapter: GPUAdapter;
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
}> {
  if (!navigator.gpu) throw new Error("Unable to init navigator");
  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) throw new Error("Unable to init adapter");
  const device = await adapter.requestDevice({
    label: "Ozzy Adapter",
    requiredFeatures: ["texture-compression-bc"],
    requiredLimits: {
      maxStorageBufferBindingSize: adapter.limits.maxStorageBufferBindingSize,
    },
  });

  adapter.features.forEach((v) => console.log(v));

  console.log(adapter);

  console.log(device);

  const canvas = document.querySelector("canvas");
  if (!canvas) throw new Error("Unable to init canvas");

  const context = canvas.getContext("webgpu");
  if (!context) throw new Error("Unable to init context");

  const format = navigator.gpu.getPreferredCanvasFormat();

  context.configure({
    device,
    format,
  });

  console.log(format);
  return { adapter, device, context, format };
}

function initPipeLine(device: GPUDevice) {}

async function run() {
  const { device } = await initWebGPU();
  initPipeLine(device);
}

run();
