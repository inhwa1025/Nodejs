var f = function(){
    console.log(1+1);
    console.log(1+2);
  }
  var a = [f];
  a[0](); // 2 3
   
  var o = {
    func:f
  }
  o.func(); // 2 3