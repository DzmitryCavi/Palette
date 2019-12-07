
let canvas = document.querySelector("canvas"), 
ctx = canvas.getContext("2d");
canvas.addEventListener('contextmenu', e => e.preventDefault());

let primaryColorPicker = document.querySelector('#primary-color'),
secondaryColorPicker = document.querySelector('#secondary-color'),
primaryColorValue = primaryColorPicker.value, 
secondaryColorValue = secondaryColorPicker.value,
matrixSize = 4;

primaryColorPicker.addEventListener('change', ()=>{
    primaryColorValue = primaryColorPicker.value;
});
secondaryColorPicker.addEventListener('change', ()=>{
    secondaryColorValue = secondaryColorPicker.value;
});

let drawMatrix = (n,data) => {
    let width = n, 
    height = n, 
    scale = canvas.width / n; 
    fetch(data)
        .then(response => response.json())
        .then(cdata => {
            let makeColor = function(d) {return d;};
            if(data == 'data/4x4.json'){
                makeColor = function(d){ return '#' + d; };
            }else if(data == 'data/32x32.json'){
                makeColor = function(d){ 
                 let [r,g,b,a] = d;
                    return `rgba(${r}, ${g}, ${b}, ${a})`; 
                };
            }

          
             for(var row = 0; row < height; row++) {
                 for(var col = 0; col < width; col++) {
                    ctx.fillStyle = makeColor(cdata[col][row]);
                    ctx.fillRect(col * scale, row * scale, scale, scale);
                }
            }
         });       
}
 let drawPNG = () => {
    const img = new Image(canvas.width, canvas.height);
    img.onload = ()=>{
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    }
    img.src = 'data/image.png';
}

let drawPencil = () => {

}

let matrix32 = document.getElementById('set_32x32');
let matrix4 = document.getElementById('set_4x4');
let png = document.getElementById('set_png');
matrix4.addEventListener('click', ()=>{drawMatrix(4,'data/4x4.json'); matrixSize = 4;});
matrix32.addEventListener('click', ()=>{drawMatrix(32,'data/32x32.json'); matrixSize = 32;} );
png.addEventListener('click', drawPNG);




let clickOnToolWrap = (e) => {
    let targetClassList = e.target.classList;
    for (let i = 0; i < targetClassList.length; i++) {
        if (targetClassList[i] === 'tools__item') {
            targetClassList.forEach(item => {
                if (item !== 'tools__item')
                    Tool = item;
            });
            let toolsItems = document.querySelectorAll('.tools__item');
            toolsItems.forEach(item => item.classList.remove('active'));
            targetClassList.add('active');
            break;
        } else {
            Tool = null;
        }
    }
    switchTool();
};

let Tool, 
toolsWrap = document.querySelector('.tools');
toolsWrap.addEventListener('click', clickOnToolWrap);

let switchTool = () => {
    unDrawByPen();
    unFillByPaintBucket();
    unTakeColor();
    switch (Tool) {
        case 'tools__pen':
            drawByPen();
            break;
        case 'tools__paint-bucket':
            fillByPaintBucket();
            break;
        case 'tools__take-color':
            takeColor();
            break;
        default:
            break;
    }
}

let userDrawOnCanvas = false;

let startPositionLine = (e) => {
    userDrawOnCanvas = true;
    draw(e);
}

let finishedPositionLine = () => {
    userDrawOnCanvas = false;
}

let draw = (e) => {
    if (!userDrawOnCanvas) return;
    if (e.which === 1) {
        ctx.fillStyle = primaryColorValue;
    } else if (e.which === 3) {
        ctx.fillStyle = secondaryColorValue;
    }
    const pixelWidth = canvas.width/matrixSize;
    const penX = Math.floor((e.offsetX * matrixSize) / canvas.width)*pixelWidth;
    const penY = Math.floor((e.offsetY * matrixSize) / canvas.height)*pixelWidth;
    ctx.fillRect(penX, penY, pixelWidth, pixelWidth);
  
}

let drawByPen = () => {
    canvas.addEventListener('mousedown', startPositionLine);
    canvas.addEventListener('mouseup', finishedPositionLine);
    canvas.addEventListener('mousemove', draw);
}

let unDrawByPen = () => {
    canvas.removeEventListener('mousedown', startPositionLine);
    canvas.removeEventListener('mouseup', finishedPositionLine);
    canvas.removeEventListener('mousemove', draw);
}

let fillByPaintBucket = () => {
    canvas.addEventListener('mouseup', paintBucket);
}
let unFillByPaintBucket = () => {
    canvas.removeEventListener('mouseup', paintBucket);
}

let paintBucket = (e) => {
    let colorR = parseInt(primaryColorValue.slice(1,3), 16),
        colorG = parseInt(primaryColorValue.slice(3,5), 16),
        colorB = parseInt(primaryColorValue.slice(5,7), 16),
        colorLayer = ctx.getImageData(0,0,canvas.width,canvas.height),
        pixelWidth = canvas.width/matrixSize,
        coordinateX = Math.floor((e.offsetX * matrixSize) / canvas.width)*pixelWidth,
        coordinateY = Math.floor((e.offsetY * matrixSize) / canvas.height)*pixelWidth,
        pixelStack = [[coordinateX, coordinateY]],
        startR, startG, startB,
        targetColor = ctx.getImageData(coordinateX,coordinateY,1,1);
        
        startR = targetColor.data[0];
        startG = targetColor.data[1];
        startB = targetColor.data[2];

        if (colorR === startR && colorG === startG && colorB === startB) {
            return;
        }
        let matchStartColor = (pixelPos) => {
            let r = colorLayer.data[pixelPos];
            let g = colorLayer.data[pixelPos + 1];
            let b = colorLayer.data[pixelPos + 2];
    
            return (r == startR && g == startG && b == startB);
        }
        let colorPixel = (pixelPos) => {
            colorLayer.data[pixelPos] = colorR;
            colorLayer.data[pixelPos + 1] = colorG;
            colorLayer.data[pixelPos + 2] = colorB;
            colorLayer.data[pixelPos + 3] = 255;
        }
        while (pixelStack.length) {
            let newPos, x, y, pixelPos, reachLeft, reachRight;
            newPos = pixelStack.pop();
            x = newPos[0];
            y = newPos[1];
    
            pixelPos = (y * canvas.width + x) * 4;
            while (y-- >= 0 && matchStartColor(pixelPos)) {
                pixelPos -= canvas.width * 4;
            }
    
            pixelPos += canvas.width * 4;
            ++y;
            reachLeft = false;
            reachRight = false;
            while (y++ < canvas.height - 1 && matchStartColor(pixelPos)) {
                colorPixel(pixelPos);
    
                if (x > 0) {
                    if (matchStartColor(pixelPos - 4)) {
                        if (!reachLeft) {
                            pixelStack.push([x - 1, y]);
                            reachLeft = true;
                        }
                    }
                    else if (reachLeft) {
                        reachLeft = false;
                    }
                }
    
                if (x < canvas.width - 1) {
                    if (matchStartColor(pixelPos + 4)) {
                        if (!reachRight) {
                            pixelStack.push([x + 1, y]);
                            reachRight = true;
                        }
                    }
                    else if (reachRight) {
                        reachRight = false;
                    }
                }
    
                pixelPos += canvas.width * 4;
            }
        }
        ctx.putImageData(colorLayer, 0, 0);
}

let takeColor = () =>{
    canvas.addEventListener('mouseup', Take);
}
let unTakeColor =() =>{
    canvas.removeEventListener('mouseup', Take);
}
let Take = (e)=>{
    let color = ctx.getImageData(e.offsetX,e.offsetX,1,1),
    R = color.data[0].toString(16).toUpperCase(),
    G = color.data[1].toString(16).toUpperCase(),
    B = color.data[2].toString(16).toUpperCase();
    R = R.length == 1 ? R+R : R;
    G = G.length == 1 ? G+G : G;
    B = B.length == 1 ? B+B : B;
    primaryColorPicker.value = '#'+R+G+B;
}

let myStorage = window.localStorage;
document.addEventListener('mouseup', ()=>{
   localStorage.setItem('Img', canvas.toDataURL());
});
window.addEventListener('load', () => {
   canvas.addEventListener('mousedown', startPositionLine);
   canvas.addEventListener('mouseup', finishedPositionLine);
   canvas.addEventListener('mousemove', draw);

   let savedImg =  localStorage.getItem('Img');
   let img = new Image;
   if(savedImg != null){
    img.src = savedImg;    
    img.addEventListener('load',() => {
        ctx.drawImage(img, 0, 0);
    });    
   }; 
});


window.addEventListener('keydown', (e) => {
    if (e.key === 'p') switchToolWithKey('tools__pen');
    else if (e.key === 'b') switchToolWithKey('tools__paint-bucket');
    else if (e.key === 'c') primaryColor.click();
    else if (e.key === 's') secondaryColor.click();
    else return;
})

function switchToolWithKey(targetClass) {
    let toolsItems = document.querySelectorAll('.tools__item');
    toolsItems.forEach(item => {
        if (item.classList[1] === targetClass) item.classList.add('active');
        else item.classList.remove('active');
    });
    Tool = targetClass;
    switchTool();
}
