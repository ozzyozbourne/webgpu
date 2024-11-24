import "./style.css";
import vertex from "./shaders/triangle.vert.wgsl?raw";
import frag from "./shaders/red.frag.wgsl?raw";

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

async function initPipeLine(
  device: GPUDevice,
  format: GPUTextureFormat,
): Promise<GPURenderPipeline> {
  const discriptor: GPURenderPipelineDescriptor = {
    layout: "auto",
    vertex: {
      module: device.createShaderModule({
        code: vertex,
      }),
      entryPoint: "main",
    },
    fragment: {
      module: device.createShaderModule({
        code: frag,
      }),
      entryPoint: "main",
      targets: [{ format }],
    },
    primitive: {
      topology: "triangle-strip",
    },
  };

  return device.createRenderPipelineAsync(discriptor);
}

function draw(
  device: GPUDevice,
  context: GPUCanvasContext,
  pipeline: GPURenderPipeline,
) {
  const encoder = device.createCommandEncoder();
  const view = context.getCurrentTexture().createView();

  const renderPassDescriptor: GPURenderPassDescriptor = {
    colorAttachments: [
      {
        view: view,
        clearValue: { r: 0, g: 0, b: 0, a: 1.0 },
        loadOp: "clear",
        storeOp: "store",
      },
    ],
  };
  const passEncoder = encoder.beginRenderPass(renderPassDescriptor);

  passEncoder.setPipeline(pipeline);
  passEncoder.draw(6);
  passEncoder.end();

  device.queue.submit([encoder.finish()]);
}

async function run() {
  const { device, context, format } = await initWebGPU();
  const pipeline = await initPipeLine(device, format);
  draw(device, context, pipeline);
}

run();
