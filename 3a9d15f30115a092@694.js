// https://observablehq.com/@f7f7156e50925896/rubin-lsst-science-collaborations-cadence-white-paper-by-s@694
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Rubin LSST Science Collaborations Cadence White Paper by SC

In 2018 the LSST Project asked the scientific community to recommend detailed LSST surveys through a White Paper submission process. 46 White papers were delivered in October 2018, largely by member of the LSST Science Collaborations", many that started in this Heising-Simons Foundation-sponsored workshop. This is an author network for these papers, mapping the connections between the paper authors and grouping papers by the Science Collaborations in which they were conceived. The size of the node (=paper) represents the number of authors, which ranges from 1 to ~70, and in some cases includes whole collaborations. (Chart style:
 [hierarchical edge bundling](/@d3/hierarchical-edge-bundling) realized with D3 on Observable). `
)});
  main.variable(observer("chart")).define("chart", ["tree","bilink","d3","data","width","line","colorin"], function(tree,bilink,d3,data,width,line,colorin)
{
  const root = tree(bilink(d3.hierarchy(data)
      .sort((a, b) => d3.ascending(a.height, b.height) || d3.ascending(a.data.id, b.data.id))));

  const svg = d3.create("svg")
      .attr("viewBox", [-width / 2, -width / 2, width, width]);
  
 

  const node = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
    .selectAll("g")
    .data(root.leaves())
    .join("g")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 97.5}) translate(${d.y},0)`)
    .append("circle")
      .attr("cx", d => "start")
      .attr("cy", 50)
      .attr("r", d => parseInt(d.data.size) > 3? parseInt(d.data.size):4 )
      .attr("fill", d => d.data.color)
    .style('fill-opacity','0.6')
      .attr("id", d => d.id)
      .text(d => d.data.id)
      .each(function(d) { d.text = this; })
      .on("mouseover", overed)
      .on("mouseout", outed)
      .call(text => text.append("title").text(d => `${d.data.id} ${d.data.author}; ${d.data.group};
${d.outgoing.length} coauthor connections`));

  
  
  const link = svg.append("g")
      .attr("stroke", "gray")
    .style('stroke-opacity','0.5')
      .attr("fill", "none")
    .selectAll("path")
    .data(root.leaves().flatMap(leaf => leaf.outgoing))
    .join("path")
      .attr("d", ([i, o]) => line(i.path(o)))
      .each(function(d) { d.path = this; });

 
  function overed(event, d) {
    link.style("mix-blend-mode", null);
    d3.select(this).attr("font-weight", "bold");
      d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", colorin).attr("stroke-width", 3).style('stroke-opacity','0.5');
    d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill",colorin).attr("font-weight", "bold");
    d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", colorin).attr("font-weight", "bold");
  }

  function outed(event, d) {
    link.style("mix-blend-mode", null);
    d3.select(this).attr("font-weight", null);
    d3.selectAll(d.incoming.map(d => d.path)).attr("stroke", null).attr("stroke-width", 1).style('stroke-opacity','0.5');
    d3.selectAll(d.incoming.map(([d]) => d.text)).attr("fill", d=>d.data.color).attr("font-weight", null);
    d3.selectAll(d.outgoing.map(d => d.path));
    d3.selectAll(d.outgoing.map(([, d]) => d.text)).attr("fill", d=>d.data.color).attr("font-weight", null);
  }
 // Scales
  var x = d3.scaleBand()
      .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
      .align(0)                  // This does nothing
      .domain([0,400]); // The domain of the X axis is the list of states.
  var y = d3.scaleRadial()
      .range([400,500])   // Domain will be define later.
      .domain([0, 400]); // Domain of Y is from 0 to the max seen in the data


  const texts = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 20)
    .selectAll("g")
    .data(root.leaves())
    .join("g")
      .attr("transform", d => `rotate(${d.x * 180 / Math.PI - 90}) translate(${d.y},-50) translate(${d.x},10)`)
    .append("text")
      .attr("dy", d => d.x >= Math.PI ? "3.1em":"-1.5em")
      .attr("x", d => d.x < Math.PI ? 6 : -6)
      .attr("text-anchor", d => d.x < Math.PI ? "start" : "end")
      .attr("transform", d => d.x >= Math.PI ? "rotate(-90)" : "rotate(90)" ).style("fill", d => d.data.color)
      .text(d => d.data.SC)
      .each(function(d) { d.text = this; });

  
  return svg.node();
}
);
  main.variable(observer("graph")).define("graph", ["d3"], function(d3){return(
d3.json("https://raw.githubusercontent.com/fedhere/WPauthors/main/WPauthors.json")
)});
  main.variable(observer("data")).define("data", ["graph"], function(graph)
{
  const {nodes, links} = graph;
  const groupById = new Map;
  const nodeById = new Map(nodes.map(node => [node.id, node]));

  for (const node of nodes) {
    let group = groupById.get(node.group);
    if (!group) groupById.set(node.group, group = {id: node.group, children: []});
    group.children.push(node);
    node.targets = [];
  }

  for (const {source: sourceId, target: targetId} of links) {
    nodeById.get(sourceId).targets.push(targetId);
  }

  return {children: [...groupById.values()]};
}
);
  main.variable(observer("bilink")).define("bilink", function(){return(
function bilink(root) {
  const map = new Map(root.leaves().map(d => [d.data.id, d]));
  for (const d of root.leaves()) d.incoming = [], d.outgoing = d.data.targets.map(i => [d, map.get(i)]);
  for (const d of root.leaves()) for (const o of d.outgoing) o[1].incoming.push(o);
  return root;
}
)});
  main.variable(observer("colorin")).define("colorin", function(){return(
"indianred"
)});
  main.variable(observer("colorout")).define("colorout", function(){return(
"#f00"
)});
  main.variable(observer("colornone")).define("colornone", function(){return(
"#ccc"
)});
  main.variable(observer("width")).define("width", function(){return(
954
)});
  main.variable(observer("height")).define("height", function(){return(
954
)});
  main.variable(observer("radius")).define("radius", ["width"], function(width){return(
width / 2
)});
  main.variable(observer("line")).define("line", ["d3"], function(d3){return(
d3.lineRadial()
    .curve(d3.curveBundle.beta(0.85))
    .radius(d => d.y)
    .angle(d => d.x)
)});
  main.variable(observer("tree")).define("tree", ["d3","radius"], function(d3,radius){return(
d3.cluster()
    .size([2 * Math.PI, radius - 100])
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@6")
)});
  return main;
}
