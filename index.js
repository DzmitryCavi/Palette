
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
                    TOOL = item;
            });
            let toolsItems = document.querySelectorAll('.tools__item');
            toolsItems.forEach(item => item.classList.remove('active'));
            targetClassList.add('active');
            break;
        } else {
            TOOL = null;
        }
    }
    switchTool();
};

let TOOL, 
toolsWrap = document.querySelector('.tools');
toolsWrap.addEventListener('click', clickOnToolWrap);

let switchTool = () => {
    unDrawByPen();
    switch (TOOL) {
        case 'tools__pen':
            drawByPen();
            break;
        case 'tools__paint-bucket':
            fillByPaintBucket();
            break;
        case 'tools__swap-color':
            fillBySwapColor();
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



let myStorage = window.localStorage;
document.addEventListener('mouseup', ()=>{
   localStorage.setItem('Img', canvas.toDataURL());
});
window.addEventListener('load', () => {
   let savedImg =  localStorage.getItem('Img');
   let img = new Image;
   if(savedImg != null){
    img.src = savedImg;    
    img.addEventListener('load',() => {
        ctx.drawImage(img, 0, 0);
    });    
   }; 
})