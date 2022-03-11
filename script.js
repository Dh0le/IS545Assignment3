let treeDataPoints = [];
let treesData = [];
trees = d3.csv("./City_Owned_Trees.csv", d3.autoType).then((trees) => {
  createPlot(trees);
  createBrush(d3.select("svg"), trees);
  d3.select("svg g").on("mousehold.drag", () => {});
});

createPlot = function (trees) {
  //create the svg for tree map
  const div = d3.select("div");
  const svgHeight = 800;
  const svgWidth = 800;
  const svg = div
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);
  //create scale
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(trees, (d) => d.X))
    .range([0, svgWidth]);
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(trees, (d) => d.Y))
    .range([svgHeight, 0]);
  // plot each trees
  treeDataPoints = svg
    .append("g")
    .attr("id", "treecircles")
    .selectAll("circle")
    .data(trees)
    .enter()
    .append("circle")
    .attr("cx", (d) => xScale(d.X))
    .attr("cy", (d) => yScale(d.Y))
    .attr("Address", (d) => d.ADDRESS)
    .attr("Street", (d) => d.STREET)
    .attr("Common", (d) => d.COMMON)
    .attr("r", 2);

  //set pan and zoom
};

//create brush
const createBrush = function (svg, trees) {
  const div = d3.select("div");
  const text = div.append("p");
  const svgHeight = 800;
  const svgWidth = 800;
  const histSvg = div.append("svg").attr("width", svgWidth).attr("height", 200);
  const list = div.append("ul");
  const xScale = d3
    .scaleLinear()
    .domain(d3.extent(trees, (d) => d.X))
    .range([0, svgWidth]);
  const yScale = d3
    .scaleLinear()
    .domain(d3.extent(trees, (d) => d.Y))
    .range([svgHeight, 0]);
  const brush = d3.brush();
  svg
    .append("g")
    .attr("class", "brush")
    .attr("id", "brush_id")
    .call(
      brush.on("brush", (event) => {
        let count = 0;
        const selection = [
          [
            xScale.invert(event.selection[0][0]),
            yScale.invert(event.selection[0][1]),
          ],
          [
            xScale.invert(event.selection[1][0]),
            yScale.invert(event.selection[1][1]),
          ],
        ];
        let selectedTrees = [];
        treeDataPoints.classed("selected", (d) => {
          let isSelect =
            selection[0][0] <= d.X &&
            selection[1][0] >= d.X &&
            selection[0][1] >= d.Y &&
            selection[1][1] <= d.Y;
          if (isSelect) {
            count += 1;
            selectedTrees.push(d);
          }
          return isSelect;
        });
        listOfTrees(list, selectedTrees);
        selectTrees(histSvg, selectedTrees, trees);
        text.text(`Selected: ${count}`);
      })
    );
};

listOfTrees = function (list, selectedTrees) {
  list.selectAll("li").remove();
  list
    .selectAll("li")
    .data(selectedTrees)
    .enter()
    .append("li")
    .text((d) => {
      return (
        "Address:" + d.ADDRESS + "  " + d.STREET + " " + "Tree Type:" + d.COMMON
      );
    });
};
// histogram display with select brush
selectTrees = function (svg, selectedTrees, trees) {
  svg.selectAll("rect").remove();
  const svgWidth = 800;
  const svgHeight = 800;
  const xScale = d3
    .scaleBand()
    .domain(d3.range(d3.max(trees, (d) => d.TRUNKS)))
    .range([0, svgWidth])
    .paddingInner(0.1);
  const yScale = d3
    .scaleLog()
    .domain([1, selectedTrees.length])
    .range([0, svgHeight]);
  const binnedTrunks = d3.bin().value((d) => d.TRUNKS)(selectedTrees);
  svg
    .selectAll("rect")
    .data(binnedTrunks)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.x0))
    .attr("y", yScale(0))
    .attr("width", xScale.bandwidth())
    .attr("height", (d) => yScale(d.length))
    .style("fill", "black");
};

function switchButtonColor() {
  const button = document.getElementById("button");
  if (
    button.style.backgroundColor === "blue" ||
    button.style.backgroundColor === ""
  ) {
    button.style.backgroundColor = "Green";
    button.innerText = "Zoom and Drag mode: On";
  } else {
    button.style.backgroundColor = "blue";
    button.innerText = "Brush Select Mode :On";
  }
}

function onButtonClick() {
  switchButtonColor();

  // add brush element because it does not exist
  if (d3.selectAll("#brush_id").empty()) {
    // create a variable that allowing users to implement brushing
    // set it to call the brushend function whenever a new brush rectangle is created
    trees = d3.csv("./City_Owned_Trees.csv", d3.autoType).then((trees) => {
      createBrush(d3.select("svg"), trees);
      let zoom = d3.zoom().on("zoom", null);
      function handleZoom(e) {
        d3.select("svg g").attr("transform", e.transform);
      }

      function initZoom() {
        d3.select("svg").call(zoom);
      }
      initZoom();
      d3.select("svg").transition().call(zoom.transform, d3.zoomIdentity);
    });
  }

  // if brush is currently activated then remove it
  else {
    d3.selectAll("#brush_id").remove();
    let zoom = d3.zoom().on("zoom", handleZoom);
    function handleZoom(e) {
      d3.select("svg g").attr("transform", e.transform);
    }

    function initZoom() {
      d3.select("svg").call(zoom);
    }
    initZoom();
    d3.select("svg").transition().call(zoom.transform, d3.zoomIdentity);
  }
}
