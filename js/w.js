let dragEl = $('.point-content');
let pointPointerEl = $('.point-pointer');

let containerEl = $('.board-container');
let pointItemEl = $('.point-item > div');

let piOffset = pointItemEl.offset();
//console.log('piOffset  ',piOffset);
dragEl.on("mousedown", (e)=>{
  let dx, dy, el = dragEl;
  
  e.preventDefault();
  let os = el.offset();
  dx = e.pageX - os.left;
  dy = e.pageY - os.top;
   
  $(document).on("mousemove.point-content", (e)=>{
    el.offset({top: e.pageY - dy, left: e.pageX - dx});
    
    let topPi = Math.round(el.offset().top - piOffset.top);
    let leftPi = Math.round(el.offset().left - piOffset.left);
    
    el.text(topPi + ' : '+ leftPi); 
    
    let dragElWidth = dragEl.outerWidth();
    let dragElHeight = dragEl.outerHeight();
    //console.log('dragElWidth  ',dragElWidth);
    //console.log('dragElHeight  ',dragElHeight);
    
    
    
    let pointLT = { x: leftPi, y: topPi };
    let pointLB = { x: leftPi, y: topPi / Math.abs(topPi) * (Math.abs(topPi) - dragElHeight )};
    let pointRT = { x: leftPi / Math.abs(leftPi) * (Math.abs(leftPi) - dragElWidth), y: topPi };
    let pointRB = { x: leftPi / Math.abs(leftPi) * (Math.abs(leftPi) - dragElWidth), y: topPi / Math.abs(topPi) * (Math.abs(topPi) - dragElHeight ) };
    let pointerLength, pointerAng;
    
    
    if( leftPi + 0.5 * dragElWidth < 0 && topPi + 0.5 * dragElHeight < 0 ) {
      // LT sector pointRB
      // el.text(pointRB.y + ' : '+ pointRB.x);
      pointerLength = Math.sqrt(pointRB.x * pointRB.x + pointRB.y * pointRB.y);
     // console.log('pointerAng  ', Math.atan( pointRB.y / pointRB.x ) * 57.2958);
      if(pointRB.x <= 0) {
        pointerAng = 180 + Math.atan( pointRB.y / pointRB.x ) * 57.2958;
      } else {
        pointerAng = 360 + Math.atan( pointRB.y / pointRB.x ) * 57.2958;
      }
           
      pointPointerEl.css({
        
        'width': pointerLength + 2 +'px',
        'transform-origin': '0',
        'transform': 'rotate('+pointerAng+'deg)'
       });
       
    } else if ( leftPi + 0.5 * dragElWidth >= 0 && topPi + 0.5 * dragElHeight < 0  ) {
      // RT sector pointLB
      //el.text(pointLB.y + ' : '+ pointLB.x);
      pointerLength = Math.sqrt(pointLB.x * pointLB.x + pointLB.y * pointLB.y);
      
      //console.log('pointerAng  ', Math.atan( pointLB.y / pointLB.x ) * 57.2958);
      if(pointLB.x <= 0) {
        pointerAng = 180 + Math.atan( pointLB.y / pointLB.x ) * 57.2958;
      } else {
        pointerAng = 360 + Math.atan( pointLB.y / pointLB.x ) * 57.2958;
      }
      pointPointerEl.css({
        'width': pointerLength + 2 +'px',
        'transform-origin': '0',
        'transform': 'rotate('+pointerAng+'deg)'
       });
      
      
      
      
    } else if ( leftPi + 0.5 * dragElWidth >= 0 && topPi + 0.5 * dragElHeight >= 0  ) {
      // RB sector pointLT
      // el.text(pointLT.y + ' : '+ pointLT.x);
      pointerLength = Math.sqrt(pointLT.x * pointLT.x + pointLT.y * pointLT.y);
      
      //console.log('pointerAng  ', Math.atan( pointLT.y / pointLT.x ) * 57.2958);
      if(pointLT.x <= 0) {
        pointerAng = 180 + Math.atan( pointLT.y / pointLT.x ) * 57.2958;
      } else {
        pointerAng = 360 + Math.atan( pointLT.y / pointLT.x ) * 57.2958;
      }
      pointPointerEl.css({
        'width': pointerLength + 2 +'px',
        'transform-origin': '0',
        'transform': 'rotate('+pointerAng+'deg)'
       });
      
    } else if ( leftPi + 0.5 * dragElWidth < 0 && topPi + 0.5 * dragElHeight >= 0  ) {
      // LB sector pointRT
      // el.text(pointRT.y + ' : '+ pointRT.x);
      pointerLength = Math.sqrt(pointRT.x * pointRT.x + pointRT.y * pointRT.y);
      
     // console.log('pointerAng  ', Math.atan( pointRT.y / pointRT.x ) * 57.2958);
      if(pointRT.x <= 0) {
        pointerAng = 180 + Math.atan( pointRT.y / pointRT.x ) * 57.2958;
      } else {
        pointerAng = 360 + Math.atan( pointRT.y / pointRT.x ) * 57.2958;
      }
      pointPointerEl.css({
        'width': pointerLength + 2 +'px',
        'transform-origin': '0',
        'transform': 'rotate('+pointerAng+'deg)'
       });
    } else {
      
    }
     
  });
  
});

$(document).on("mouseup", (e)=>{
  console.log('e.offset().left', $(e.target).offset().left );
  console.log('piOffset  ',piOffset);
  $(document).off("mousemove.point-content");
  //console.log('mouseup');
});


