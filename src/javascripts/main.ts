"use strict";

function CalculateVh()
{
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', vh + 'px');
}

window.addEventListener('DOMContentLoaded', CalculateVh);
window.addEventListener('resize', CalculateVh);
window.addEventListener('orientationchange', CalculateVh);

class Colour
{
  r: number = 0;
  g: number = 0;
  b: number = 0;
  fillStyle: string = '';
  constructor(r:number, g:number, b:number)
  {
    this.r = r;
    this.g = g;
    this.b = b;
    this.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
  }
}

class Group
{
  agents: Agent[] = [];
  size: number = 1;
  width: number = 1;
  height: number = 1;
  iterator: number = 0;
  restitution: number = 0.9;
  constructor(size: number, width: number, height: number)
  {
    this.agents = [];
    this.size = size;
    this.width = width;
    this.height = height;
    this.iterator = 0;
    this.restitution = 0.9;
  }

  Start()
  {
    let colours: Colour[] = [];
    let colourCount = Math.floor(Math.random() * 5) + 2;
    for(let i = 0; i < colourCount; i++)
    {
      let r = Math.floor(Math.random() * 255);
      let g = Math.floor(Math.random() * 255);
      let b = Math.floor(Math.random() * 255);
      let col = new Colour(r, g, b);
      colours.push(col);
    }

    this.agents.length = 0;
    for(let i = 0; i < this.size; i++)
    {
      let startW = Math.floor(Math.random() * this.width);
      let startH = Math.floor(Math.random() * this.height);
      let startVW = Math.floor(Math.random() * 5);
      let startVH = Math.floor(Math.random() * 5);
      if(Math.random() > 0.5) startVW = -startVW;
      if(Math.random() > 0.5) startVH = -startVH;

      let r = Math.floor(Math.random() * colours.length);
      let mass = Math.floor(Math.random() * 40) + 10;
      let radius = mass / 2;
      let newAgent = new Agent(i, radius, startW, startH, startVW, startVH, mass, colours[r]);
      this.agents.push(newAgent);
    }
    this.DrawGroup();
  }

  Iterate()
  {
    if(this.iterator !== 0) return;
    this.iterator = setInterval(() =>
    {
      this.Update();
    },
    16);
  }

  Pause()
  {
    clearInterval(this.iterator);
    this.iterator = 0;
  }

  Toggle()
  {
    if(this.iterator === 0)
    {
      this.Iterate();
    }
    else
    {
      this.Pause();
    }
  }

  Update()
  {
    for(let i = 0; i < this.agents.length; i++)
    {
      this.MovePosition(this.agents[i]);
      this.agents[i].isColliding = false;
    }
    this.DetectCollisions();
    this.DetectEdgeCollisions();
    this.DrawGroup();
  }

  MovePosition(agent: Agent)
  {
    // agent.vy += g / 62.5;
    agent.x += agent.vx;
    agent.y += agent.vy;
  }

  DetectCollisions()
  {
    let obj1;
    let obj2;

    for(let i = 0; i < this.agents.length; i++)
    {
      obj1 = this.agents[i];
      // this.agents[i].vy += g / 62.5;
      for(let j = 0; j < this.agents.length; j++)
      {
        if(j == i) continue;
        obj2 = this.agents[j];
        if(this.CircleIntersect(obj1.x, obj1.y, obj1.radius, obj2.x, obj2.y, obj2.radius))
        {
          obj1.isColliding = true;
          obj2.isColliding = true;
          if(Math.random() > 0.5)
          {
            obj1.colour = obj2.colour;
          }
          else
          {
            obj2.colour = obj1.colour;
          }
          let vCollision = {x: obj2.x - obj1.x, y: obj2.y - obj1.y};
          let distance = Math.sqrt((obj2.x-obj1.x)*(obj2.x-obj1.x) + (obj2.y-obj1.y)*(obj2.y-obj1.y));
          let vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};
          let vRelativeVelocity = {x: obj1.vx - obj2.vx, y: obj1.vy - obj2.vy};
          let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
          speed *= Math.min(obj1.restitution, obj2.restitution);
          if(speed < 0)
          {
            break;
          }
          let impulse = 2 * speed / (obj1.mass + obj2.mass);
          obj1.vx -= (impulse * obj2.mass * vCollisionNorm.x);
          obj1.vy -= (impulse * obj2.mass * vCollisionNorm.y);
          obj2.vx += (impulse * obj1.mass * vCollisionNorm.x);
          obj2.vy += (impulse * obj1.mass * vCollisionNorm.y);
        }
      }
    }
  }

  CircleIntersect(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number)
  {
    let squareDistance = (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2);
    return squareDistance <= ((r1 + r2) * (r1 + r2))
  }

  DetectEdgeCollisions()
  {
    let obj;
    for(let i = 0; i < this.agents.length; i++)
    {
      obj = this.agents[i];
      if(obj.x < obj.radius)
      {
        obj.vx = Math.abs(obj.vx) * this.restitution;
        obj.x = obj.radius;
      }
      else if(obj.x > this.width - obj.radius)
      {
        obj.vx = -Math.abs(obj.vx) * this.restitution;
        obj.x = this.width - obj.radius;
      }
      if(obj.y < obj.radius)
      {
        obj.vy = Math.abs(obj.vy) * this.restitution;
        obj.y = obj.radius;
      }
      else if(obj.y > this.height - obj.radius)
      {
        obj.vy = -Math.abs(obj.vy) * this.restitution;
        obj.y = this.height - obj.radius;
      }
    }
  }

  DrawGroup()
  {
    c.clearRect(0, 0, this.width, this.height);
    for(let i = 0; i < this.agents.length; i++)
    {
      if(c.fillStyle != this.agents[i].colour.fillStyle) c.fillStyle = this.agents[i].colour.fillStyle;
      c.beginPath();
      c.arc(this.agents[i].x, this.agents[i].y, this.agents[i].radius, 0, 2 * Math.PI);
      c.fill();
    }
  }

  Click(x: number, y: number)
  {
    let radius = 50;
    for(let j = 0; j < this.agents.length; j++)
    {
      let object = this.agents[j];
      if(this.CircleIntersect(x, y, radius, object.x, object.y, object.radius))
      {
        let vCollision = {x: object.x - x, y: object.y - y};
        let distance = Math.sqrt((object.x-x)*(object.x-x) + (object.y-y)*(object.y-y));
        let vCollisionNorm = {x: vCollision.x / distance, y: vCollision.y / distance};
        let vRelativeVelocity = {x: (-object.vx * 10) - object.vx, y: (-object.vy * 10) - object.vy};
        let speed = vRelativeVelocity.x * vCollisionNorm.x + vRelativeVelocity.y * vCollisionNorm.y;
        speed *= object.restitution;
        if(speed <= 0)
        {
          let randVel = Math.floor(Math.random() * 25) + 5;
          if(Math.random() < 0.25)
          {
            object.vx += randVel;
            object.vy += randVel;
          }
          else if(Math.random() >= 0.25 && Math.random() < 0.5)
          {
            object.vx -= randVel;
            object.vy += randVel;
          }
          else if(Math.random() >= 0.5 && Math.random() < 0.75)
          {
            object.vx += randVel;
            object.vy -= randVel;
          }
          else if(Math.random() >= 0.75)
          {
            object.vx -= randVel;
            object.vy -= randVel;
          }
        }
        let impulse = 2 * speed / (50 + object.mass);
        object.vx += (impulse * 50 * vCollisionNorm.x);
        object.vy += (impulse * 50 * vCollisionNorm.y);
      }
    }
  }
}

class Agent
{
  index: number = 0;
  radius: number = 0;
  x: number = 0;
  y: number = 0;
  vx: number = 0;
  vy: number = 0;
  mass: number = 0;
  colour: Colour = new Colour(0,0,0);
  isColliding: boolean = false;
  restitution: number = 0.9;
  constructor(index: number, radius: number, x: number, y: number, vx: number, vy: number, mass: number, col: Colour)
  {
    this.index = index;
    this.radius = radius;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.isColliding = false;
    this.colour = col;
    this.mass = mass;
    this.restitution = 0.9;
  }
}

const playPauseButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("playPauseButton");
const playPauseButtonSource: HTMLImageElement = <HTMLImageElement>document.getElementById("playPauseButtonSource");
const resetButton: HTMLButtonElement = <HTMLButtonElement>document.getElementById("resetButton");
const gameDiv: HTMLElement = <HTMLElement>document.getElementById("gameDiv");
const gameCanvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("gameCanvas");
const c: CanvasRenderingContext2D = <CanvasRenderingContext2D>gameCanvas.getContext("2d");

playPauseButton.onclick = function(){ ToggleGroup() };
resetButton.onclick = function(){ Main() };

let toggleS: boolean = false;
const g: number = 9.81;

let group: Group = new Group(0, 0, 0);
let running = undefined;
let runningBool: boolean = false;

function Main()
{
  ReSize();
  playPauseButtonSource.src = "./play.svg";
  let w = gameCanvas.width;
  let h = gameCanvas.height;
  let size = Math.floor(Math.random() * 145) + 5;
  if(group != null)
  {
    group.Pause();
    group = new Group(0, 0, 0);
  }
  group = new Group(size, w, h);
  group.Start();
  group.Pause();
}

function ToggleGroup()
{
  group.Toggle();
  if(group.iterator === 0) playPauseButtonSource.src = "./play.svg";
  else playPauseButtonSource.src = "./pause.svg";
}

function ReSize()
{
  gameDiv.style.width = window.innerWidth + 'px';
  gameDiv.style.height = window.innerHeight * 0.925 + 'px';
  gameCanvas.width = window.innerWidth;
  gameCanvas.height = window.innerHeight * 0.925;
  if(group != null)
  {
    group.width = gameDiv.scrollWidth;
    group.height = gameDiv.scrollHeight;
    group.DrawGroup();
  }
}

gameCanvas.onmousedown = function(event)
{
  event.preventDefault();
  let rect = gameCanvas.getBoundingClientRect();
  let x = event.clientX - rect.left;
  let y = event.clientY - rect.top;
  if(group != null) group.Click(x, y);
};

gameCanvas.ontouchstart = function(event)
{
  event.preventDefault();
  if(event.touches != undefined)
  {
    let rect = gameCanvas.getBoundingClientRect();
    let touch = event.touches[0] || event.changedTouches[0];
    let x = touch.pageX - rect.left;
    let y = touch.pageY - rect.top;
    if(group != null) group.Click(x, y);
  }
};

window.addEventListener('resize', ReSize);
document.addEventListener("DOMContentLoaded", Main);