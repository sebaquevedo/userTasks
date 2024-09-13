import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-mandelbrot',
  templateUrl: './mandelbrot.component.html',
  styleUrls: ['./mandelbrot.component.css'],
  standalone: true,
})
export class MandelbrotComponent implements OnInit {
  @ViewChild('mandelbrotCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private maxIterations = 1000;
  private scale = 200;
  private canvasWidth = 800;
  private canvasHeight = 600;
  private centerX = 0;
  private centerY = 0;
  private targetScale = this.scale;
  private targetCenterX = this.centerX;
  private targetCenterY = this.centerY;
  private zoomSteps = 30;

  // Burst animation object, initialized in ngOnInit since we use mo.js from CDN
  private burst: any;

  ngOnInit(): void {
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    console.log('mo.js:', mojs);
    this.drawMandelbrotSet();

    // Initialize burst animation
    this.burst = new mojs.Burst({
      radius: { 0: 300 },
      count: 15,
      children: {
        shape: 'circle',
        radius: 20,
        fill: { cyan: 'magenta' },
        duration: 3000,
      },
    });
  }

  private mandelbrot(cRe: number, cIm: number): number {
    let zRe = 0;
    let zIm = 0;
    let n = 0;

    while (n < this.maxIterations && zRe * zRe + zIm * zIm <= 4) {
      const zReNew = zRe * zRe - zIm * zIm + cRe;
      zIm = 2 * zRe * zIm + cIm;
      zRe = zReNew;
      n++;
    }

    return n;
  }

  private getColor(iterations: number): [number, number, number] {
    if (iterations === this.maxIterations) {
      return [0, 0, 0];
    }

    const t = iterations / this.maxIterations;
    const red = Math.floor(9 * (1 - t) * t * t * t * 255);
    const green = Math.floor(15 * (1 - t) * (1 - t) * t * t * 255);
    const blue = Math.floor(8.5 * (1 - t) * (1 - t) * (1 - t) * t * 255);

    return [red, green, blue];
  }

  private drawMandelbrotSet(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;

    const imgData = ctx.createImageData(this.canvasWidth, this.canvasHeight);

    for (let x = 0; x < this.canvasWidth; x++) {
      for (let y = 0; y < this.canvasHeight; y++) {
        const cRe = (x - this.canvasWidth / 2) / this.scale + this.centerX;
        const cIm = (y - this.canvasHeight / 2) / this.scale + this.centerY;

        const iterations = this.mandelbrot(cRe, cIm);

        const [red, green, blue] = this.getColor(iterations);
        const pixelIndex = (y * this.canvasWidth + x) * 4;

        imgData.data[pixelIndex] = red;
        imgData.data[pixelIndex + 1] = green;
        imgData.data[pixelIndex + 2] = blue;
        imgData.data[pixelIndex + 3] = 255;
      }
    }

    ctx.putImageData(imgData, 0, 0);
  }

  @HostListener('wheel', ['$event'])
  onZoom(event: WheelEvent): void {
    event.preventDefault();

    const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
    const mouseX = event.offsetX;
    const mouseY = event.offsetY;

    const zoomCenterRe =
      (mouseX - this.canvasWidth / 2) / this.scale + this.centerX;
    const zoomCenterIm =
      (mouseY - this.canvasHeight / 2) / this.scale + this.centerY;

    this.targetScale *= zoomFactor;
    this.targetCenterX =
      zoomCenterRe + (this.centerX - zoomCenterRe) * zoomFactor;
    this.targetCenterY =
      zoomCenterIm + (this.centerY - zoomCenterIm) * zoomFactor;

    this.animateZoom();
  }

  // @HostListener('click', ['$event'])
  // onCanvasClick(event: MouseEvent): void {
  //   const clickX = event.offsetX;
  //   const clickY = event.offsetY;

  //   const newCenterX =
  //     (clickX - this.canvasWidth / 2) / this.scale + this.centerX;
  //   const newCenterY =
  //     (clickY - this.canvasHeight / 2) / this.scale + this.centerY;

  //   this.targetCenterX = newCenterX;
  //   this.targetCenterY = newCenterY;

  //   console.log('Triggering burst animation');
  //   // Trigger burst animation
  //   this.burst.tune({ x: event.pageX, y: event.pageY }).setSpeed(3).replay();

  //   this.animateZoom();
  // }

  // private animateZoom(): void {
  //   const stepScale = (this.targetScale - this.scale) / this.zoomSteps;
  //   const stepCenterX = (this.targetCenterX - this.centerX) / this.zoomSteps;
  //   const stepCenterY = (this.targetCenterY - this.centerY) / this.zoomSteps;

  //   let step = 0;

  //   const zoomAnimation = new mojs.Tween({
  //     duration: 1000,
  //     easing: 'ease.inout',
  //     onUpdate: (progress: number) => {
  //       this.scale += stepScale * progress;
  //       this.centerX += stepCenterX * progress;
  //       this.centerY += stepCenterY * progress;
  //       this.drawMandelbrotSet();
  //     },
  //     onComplete: () => {
  //       this.scale = this.targetScale;
  //       this.centerX = this.targetCenterX;
  //       this.centerY = this.targetCenterY;
  //       this.drawMandelbrotSet();
  //     },
  //   });

  //   zoomAnimation.play();
  // }

  // @HostListener('click', ['$event'])
  // onCanvasClick(event: MouseEvent): void {
  //   const clickX = event.offsetX;
  //   const clickY = event.offsetY;

  //   const newCenterX =
  //     (clickX - this.canvasWidth / 2) / this.scale + this.centerX;
  //   const newCenterY =
  //     (clickY - this.canvasHeight / 2) / this.scale + this.centerY;

  //   this.targetCenterX = newCenterX;
  //   this.targetCenterY = newCenterY;

  //   // Trigger burst animation before zoom to ensure visibility
  //   console.log('Triggering burst animation');
  //   this.burst.tune({ x: event.pageX, y: event.pageY }).setSpeed(3).replay();

  //   // Add a small delay before starting the zoom, to ensure the burst is visible
  //   setTimeout(() => {
  //     console.log('Animating zoom');
  //     this.animateZoom();
  //   }, 300); // Add a small delay of 300ms before zoom starts
  // }

  @HostListener('click', ['$event'])
  onCanvasClick(event: MouseEvent): void {
    const clickX = event.offsetX;
    const clickY = event.offsetY;

    const newCenterX =
      (clickX - this.canvasWidth / 2) / this.scale + this.centerX;
    const newCenterY =
      (clickY - this.canvasHeight / 2) / this.scale + this.centerY;

    this.targetCenterX = newCenterX;
    this.targetCenterY = newCenterY;

    // Get the canvas's position relative to the document
    const canvas = this.canvasRef.nativeElement;
    const canvasRect = canvas.getBoundingClientRect();

    // Calculate the correct burst position relative to the document
    const burstX = canvasRect.left + clickX;
    const burstY = canvasRect.top + clickY;

    console.log(`Canvas click position: (${clickX}, ${clickY})`);
    console.log(`Burst position: (${burstX}, ${burstY})`);

    // Trigger burst animation with the corrected coordinates
    this.burst.tune({ x: burstX, y: burstY }).setSpeed(3).replay();

    // Delay zoom animation slightly to avoid overlap
    setTimeout(() => {
      this.animateZoom();
    }, 300);
  }

  private animateZoom(): void {
    const stepScale = (this.targetScale - this.scale) / this.zoomSteps;
    const stepCenterX = (this.targetCenterX - this.centerX) / this.zoomSteps;
    const stepCenterY = (this.targetCenterY - this.centerY) / this.zoomSteps;

    const zoomAnimation = new mojs.Tween({
      duration: 1000, // Adjust zoom duration for smoother animation
      easing: 'ease.inout',
      onUpdate: (progress: number) => {
        this.scale += stepScale * progress;
        this.centerX += stepCenterX * progress;
        this.centerY += stepCenterY * progress;
        this.drawMandelbrotSet();
      },
      onComplete: () => {
        this.scale = this.targetScale;
        this.centerX = this.targetCenterX;
        this.centerY = this.targetCenterY;
        this.drawMandelbrotSet();
      },
    });

    zoomAnimation.play();
  }
}
