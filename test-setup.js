
console.log("Mock io connect function called");
global.io = () => {
  return {
    on: function() {},
    emit: function() {},
  };
};