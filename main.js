var activeApartmant= null
var regionFlag = false
var selectedRegion = null
const CHART_WIDTH = 600;
const CHART_HEIGHT = 400;
const CHART_MARGIN = { top: 20, right: 30, bottom: 40, left: 50 };
var activeApartmant = null
var weekends = []
var weekdays = []
var weekdaysAll=[]
var weekendsAll=[]
function findMatchingWeekdayPrice(lat, lng) {
const weekdayObj = weekdays.find(
    (obj) => obj.lat === lat && obj.lng === lng
);

if (!weekdayObj) {
    return 0;
}

return weekdayObj.realSum;
}
function findMatchingWeekendPrice(lat, lng) {
const weekendObj = weekends.find(
    (obj) => obj.lat === lat && obj.lng === lng
);

if (!weekendObj) {
    return 0;
}

return weekendObj.realSum;
}
function openDetails(content) {
d3.select("#details-body").html(content);
d3.select("#details").style("display", "block");
}
function closeDetais() {
d3.select("#details").style("display", "none");
}
function manageWeekends() {
const flag = document.getElementById("weekendsCheckbox");
if (flag.checked) {
d3.selectAll(".circle-weekends").style("display", "block");
} else {
d3.selectAll(".circle-weekends").style("display", "none");
}
}
function manageWeekdays() {
const flag = document.getElementById("weekdaysCheckbox");
if (flag.checked) {
d3.selectAll(".circle-weekdays").style("display", "block");
} else {
d3.selectAll(".circle-weekdays").style("display", "none");
}
}


const width = 800;
const height = 300;

const svg = d3.select("#map").attr("width", 1200).attr("height", 600)
.style("border", "2px solid #dee2e6").style("border-radius", "15px").style("margin-right","10px");

const g = svg.append("g");
const gWeekends = svg.append("g").attr("class", "weekends");
const gWeekdays = svg.append("g").attr("class", "weekdays");


function drawPriceChart(data, selectedApartment) {
d3.select("#price-chart-container").remove();

const container = d3.select("#graph-body")
.append("div")
.attr("id", "price-chart-container")
.style("margin-bottom", "40px");

container.append("h4").text("Cijene u odnosu na ostale:");

const svg = container.append("svg")
.attr("id", "priceChart")
.attr("width", CHART_WIDTH)
.attr("height", CHART_HEIGHT);

const width = CHART_WIDTH - CHART_MARGIN.left - CHART_MARGIN.right;
const height = CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom;

let selectedPrice = 0;
const prices = data.map(d => parseFloat(d.realSum)).filter(p => !isNaN(p));
if (selectedApartment !== null) {
selectedPrice = parseFloat(selectedApartment.realSum);
}

const minPrice = d3.min(prices);
const maxPrice = d3.max(prices);
const avgPrice = d3.mean(prices);

const chartData = [
{ category: "Minimalna", value: minPrice },
{ category: "Prosječna", value: avgPrice },
{ category: "Maksimalna", value: maxPrice },
{ category: "Odabrani", value: selectedPrice }
];

const x = d3.scaleBand()
.domain(chartData.map(d => d.category))
.range([CHART_MARGIN.left, CHART_WIDTH - CHART_MARGIN.right])
.padding(0.3);

const y = d3.scaleLinear()
.domain([0, maxPrice * 1.1])
.range([CHART_HEIGHT - CHART_MARGIN.bottom, CHART_MARGIN.top]);

// y-os
svg.append("g")
.attr("class", "axis")
.attr("transform", `translate(${CHART_MARGIN.left}, 0)`)
.call(d3.axisLeft(y))
.selectAll("text")
.style("font-size", "12px")
.attr("dx", "-10");

// x-os
svg.append("g")
.attr("class", "axis")
.attr("transform", `translate(0, ${CHART_HEIGHT - CHART_MARGIN.bottom})`)
.call(d3.axisBottom(x))
.selectAll("text")
.style("font-size", "12px");

// barovi
svg.selectAll(".bar")
.data(chartData)
.enter()
.append("rect")
.attr("class", "bar")
.attr("x", d => x(d.category))
.attr("y", d => y(d.value))
.attr("width", x.bandwidth())
.attr("height", d => CHART_HEIGHT - CHART_MARGIN.bottom - y(d.value))
.attr("fill", d => d.category === "Odabrani" ? "orange" : "steelblue");

// labelice
svg.selectAll(".label")
.data(chartData)
.enter()
.append("text")
.attr("class", "label")
.attr("x", d => x(d.category) + x.bandwidth() / 2)
.attr("y", d => y(d.value) - 5)
.attr("text-anchor", "middle")
.style("font-size", "12px")
.text(d => d.value.toFixed(0) + " €");
}
function applyFilter (e){

e.preventDefault(); 
const minPrice = parseFloat(document.getElementById("minPrice").value) || 0;
const maxPrice = parseFloat(document.getElementById("maxPrice").value) || Infinity;
const capacity = parseFloat(document.getElementById("capacity").value) || 0;
const roomType = document.getElementById("roomType").value;
const filteredDataWeekend = weekendsAll.filter((d) => {
    const price = parseFloat(d.realSum);
    const matchesPrice = price >= minPrice && price <= maxPrice;
    const matchesRoom = roomType ? d.room_type === roomType : true;
    var matchesCapacity
    if(capacity===0)
    {
    matchesCapacity = true
    }
    else
    {
    matchesCapacity = parseInt(d.person_capacity) === capacity
    }
    return matchesPrice && matchesRoom && matchesCapacity;
});
const filteredDataWeekday = weekdaysAll.filter((d) => {
    const price = parseFloat(d.realSum);
    const matchesPrice = price >= minPrice && price <= maxPrice;
    const matchesRoom = roomType ? d.room_type === roomType : true
    var matchesCapacity
    if(capacity===0)
    {
    matchesCapacity = true
    }
    else
    {
    matchesCapacity = parseInt(d.person_capacity) === capacity
    }
    return matchesPrice && matchesRoom && matchesCapacity;
});
    const combinedData = [...filteredDataWeekend, ...filteredDataWeekday];
    weekdays=filteredDataWeekday
    weekends=filteredDataWeekend
    drawPriceChart(combinedData, activeApartmant); 
    if(regionFlag){
    RegionPriceChart(selectedRegion)
    }
const weekendsChecked = document.getElementById("weekendsCheckbox").checked;
    g.selectAll(".circle-weekends").remove();
    g.selectAll("gWeekends")
    .data(filteredDataWeekend)
    .enter()
    .append("circle")
    .attr("class", "circle-weekends")
    .attr("cx", (d) => projection([+d.lng, +d.lat])[0])
    .attr("cy", (d) => projection([+d.lng, +d.lat])[1])
    .attr("r", 1.5)
    .attr("fill", "purple")
    .attr("opacity", 0.6)
    .style("cursor", "pointer")
    .on("mouseover", (event, d) => {
        tooltip
        .style("opacity", 1)
        .html(`Cijena: €${parseFloat(d.realSum).toFixed(2)}`);
    })
    .on("mousemove", (event) => {
        tooltip
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", () => {
        tooltip.style("opacity", 0);
    })
    .on("click", (event, d) => {
        activeApartmant=d
        drawPriceChart(weekends,d)
        const content = `
        <strong>Cijena:</strong> €${parseFloat(d.realSum).toFixed(2)}<br>
        <strong>Tip:</strong> ${d.room_type}<br>
        <strong>Ka  pacitet:</strong> ${parseInt(d.person_capacity)}<br>
        <strong>Cijena preko tjedna:</strong> €${parseFloat(findMatchingWeekdayPrice(d.lat,d.lng)).toFixed(2)}<br>
        <strong>Superhost:</strong> ${d.host_is_superhost === "True" ? "Da" : "Ne"}<br>
        <strong>Ocjena gostiju:</strong> ${d.guest_satisfaction_overall}<br>
        <strong>Posjeduje privatnu sobu:</strong> ${
            d.room_private === "True" ? "Da" : "Ne"
        }<br>
        `;
        openDetails(content);
    });
    g.selectAll(".circle-weekends")
    .style("display", weekendsChecked ? "inline" : "none");
    

    const weekdaysChecked = document.getElementById("weekdaysCheckbox").checked;

        g.selectAll(".circle-weekdays").remove();
        g.selectAll("gWeekdays")
        .data(filteredDataWeekday)
        .enter()
        .append("circle")
        .attr("class", "circle-weekdays")
        .attr("cx", (d) => projection([+d.lng, +d.lat])[0])
        .attr("cy", (d) => projection([+d.lng, +d.lat])[1])
        .attr("r", 1.5)
        .attr("fill", "orange")
        .attr("opacity", 0.6)
        .style("cursor", "pointer")
        .on("mouseover", (event, d) => {
            tooltip
            .style("opacity", 1)
            .html(`Cijena: €${parseFloat(d.realSum).toFixed(2)}`);
        })
        .on("mousemove", (event) => {
            tooltip
            .style("left", event.pageX + 10 + "px")
            .style("top", event.pageY - 20 + "px");
        })
        .on("mouseout", () => {
            tooltip.style("opacity", 0);
        })
        .on("click", (event, d) => {
            activeApartmant=d
            drawPriceChart(weekdays,activeApartmant)
            const content = `
                <strong>Cijena:</strong> €${parseFloat(d.realSum).toFixed(2)}<br>
                <strong>Tip:</strong> ${d.room_type}<br>
                <strong>Cijena preko vikenda:</strong>${parseFloat(findMatchingWeekendPrice(d.lat,d.lng)).toFixed(2)}<br>
                <strong>Kapacitet:</strong> ${parseInt(d.person_capacity)}<br>
                <strong>Superhost:</strong> ${d.host_is_superhost== "True" ? "Da" : "Ne"}<br>
                <strong>Ocjena gostiju:</strong> ${d.guest_satisfaction_overall}<br>
                <strong>Posjeduje privatnu sobu:</strong> ${
                d.room_private === "True" ? "Da" : "Ne"
                }<br>
            `;
            openDetails(content);
        });
        g.selectAll(".circle-weekdays").style("display", weekdaysChecked ? "inline" : "none");
    
    };         
function resetFilter(e) {
document.getElementById("filterForm").reset();
document.getElementById("weekendsCheckbox").checked = false;
document.getElementById("weekdaysCheckbox").checked = false;
d3.select("#yourChartContainer").selectAll("*").remove(); 
g.selectAll(".circle-weekends")
    .style("display","none");
g.selectAll(".circle-weekends")
    .style("display","none");
applyFilter(e);  

}

function drawRegionComparisonChart(regionWeekdays, regionWeekends) {
d3.select("#region-chart-container").remove();

const container = d3.select("#graph-body")
.append("div")
.attr("id", "region-chart-container")
.style("margin-bottom", "40px");

container.append("h4").text("Usporedba regije: radni dani vs. vikendi");

const svg = container.append("svg")
.attr("id", "regionChart")
.attr("width", CHART_WIDTH)
.attr("height", CHART_HEIGHT);

const width = CHART_WIDTH - CHART_MARGIN.left - CHART_MARGIN.right;
const height = CHART_HEIGHT - CHART_MARGIN.top - CHART_MARGIN.bottom;

const allPrices = [...regionWeekdays, ...regionWeekends]
.map(d => parseFloat(d.realSum))
.filter(p => !isNaN(p));

if (allPrices.length === 0) return;

const chartData = [
{
    category: "Minimalna",
    week: d3.min(regionWeekdays, d => parseFloat(d.realSum)) || 0,
    weekend: d3.min(regionWeekends, d => parseFloat(d.realSum)) || 0
},
{
    category: "Prosječna",
    week: d3.mean(regionWeekdays, d => parseFloat(d.realSum)) || 0,
    weekend: d3.mean(regionWeekends, d => parseFloat(d.realSum)) || 0
},
{
    category: "Maksimalna",
    week: d3.max(regionWeekdays, d => parseFloat(d.realSum)) || 0,
    weekend: d3.max(regionWeekends, d => parseFloat(d.realSum)) || 0
}
];

const x0 = d3.scaleBand()
.domain(chartData.map(d => d.category))
.range([CHART_MARGIN.left, CHART_WIDTH - CHART_MARGIN.right])
.padding(0.3);

const x1 = d3.scaleBand()
.domain(["week", "weekend"])
.range([0, x0.bandwidth()])
.padding(0.1);

const maxY = d3.max(chartData.flatMap(d => [d.week, d.weekend]));
const y = d3.scaleLinear()
.domain([0, maxY * 1.1])
.range([CHART_HEIGHT - CHART_MARGIN.bottom, CHART_MARGIN.top]);

const color = {
week: "orange",
weekend: "green"
};

// y-os
svg.append("g")
.attr("class", "axis")
.attr("transform", `translate(${CHART_MARGIN.left}, 0)`)
.call(d3.axisLeft(y))
.selectAll("text")
.style("font-size", "12px")
.attr("dx", "-10");

// x-os
svg.append("g")
.attr("class", "axis")
.attr("transform", `translate(0, ${CHART_HEIGHT - CHART_MARGIN.bottom})`)
.call(d3.axisBottom(x0))
.selectAll("text")
.style("font-size", "12px");

const barGroups = svg.append("g");

const categoryGroups = barGroups.selectAll("g")
.data(chartData)
.enter()
.append("g")
.attr("transform", d => `translate(${x0(d.category)},0)`);

categoryGroups.selectAll("rect")
.data(d => [
    { key: "week", value: d.week },
    { key: "weekend", value: d.weekend }
])
.enter()
.append("rect")
.attr("x", d => x1(d.key))
.attr("y", d => y(d.value))
.attr("width", x1.bandwidth())
.attr("height", d => CHART_HEIGHT - CHART_MARGIN.bottom - y(d.value))
.attr("fill", d => color[d.key]);

categoryGroups.selectAll("text")
.data(d => [
    { key: "week", value: d.week },
    { key: "weekend", value: d.weekend }
])
.enter()
.append("text")
.attr("x", d => x1(d.key) + x1.bandwidth() / 2)
.attr("y", d => y(d.value) - 5)
.attr("text-anchor", "middle")
.text(d => d.value.toFixed(0) + " €")
.style("font-size", "12px");
const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", `translate(100, ${CHART_MARGIN.top})`);

const legendItems = [
  { label: "Radni dani", color: "orange" },
  { label: "Vikendi", color: "green" }
];

legendItems.forEach((item, i) => {
  const legendRow = legend.append("g")
    .attr("transform", `translate(0, ${i * 20})`);

  legendRow.append("rect")
    .attr("width", 12)
    .attr("height", 12)
    .attr("fill", item.color);

  legendRow.append("text")
    .attr("x", 40)
    .attr("y", 10)
    .text(item.label)
    .style("font-size", "12px")
    .attr("alignment-baseline", "middle");
});
}
function RegionPriceChart(selectedRegion){
regionFlag=true
const regionWeekdays= weekdays.filter(function(d) {
const point = [parseFloat(d.lng), parseFloat(d.lat)];
return d3.geoContains(selectedRegion, point);
});      
const regionWeekends= weekends.filter(function(d) {
const point = [parseFloat(d.lng), parseFloat(d.lat)];
return d3.geoContains(selectedRegion, point);
});       
console.log(regionWeekdays)
console.log(regionWeekends)
drawRegionComparisonChart(regionWeekdays, regionWeekends);
}
const tooltip = d3.select("#tooltip");
const projection = d3
.geoMercator()
.center([2.3, 48.88 ])
.scale(250000)
.translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

const zoom = d3
.zoom()
.scaleExtent([1, 20])
.on("zoom", (event) => {
g.attr("transform", event.transform);
});

svg.call(zoom);

d3.json("paris.json").then((geojson) => {
g.selectAll("path")
.data(geojson.features)
.enter()
.append("path")
.attr("d", path)
.style("fill", "#cccccc") 
.style("stroke", "#333")
.style("stroke-width", "0.5px")
.on("mouseover", function () {
if (!d3.select(this).classed("clicked")) {
d3.select(this)
    .style("fill", "#999999")
    .style("cursor", "pointer");
}
})
.on("mouseout", function () {
if (!d3.select(this).classed("clicked")) {
d3.select(this)
    .style("fill", "#cccccc")
    .style("cursor", "default");
}
})
.on("click", function (event,d) {
g.selectAll("path")
.classed("clicked", false)
.style("fill", "#cccccc");
selectedRegion=d
RegionPriceChart(d)

d3.select(this)
.classed("clicked", true)
.style("fill", "#666666");
});
g.selectAll("text")
.data(geojson.features)
.enter()
.append("text")
.attr("transform", (d) => {
    const centroid = path.centroid(d);
    return `translate(${centroid})`;
})
.text((d) => d.properties.name || "")
.style("font-size", "15 px");
});

d3.csv("paris_weekends.csv").then((data) => {
weekends=data
weekendsAll=data
g.selectAll("gWeekends")
.data(weekends)
.enter()
.append("circle")
.attr("class", "circle-weekends")
.attr("cx", (d) => projection([+d.lng, +d.lat])[0])
.attr("cy", (d) => projection([+d.lng, +d.lat])[1])
.attr("r", 3)
.attr("fill", "purple")
.attr("opacity", 0.6)
.style("cursor", "pointer")
.style("display", "none")
.on("mouseover", (event, d) => {
    tooltip
    .style("opacity", 1)
    .html(`Cijena: €${parseFloat(d.realSum).toFixed(2)}`);
})
.on("mousemove", (event) => {
    tooltip
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 20 + "px");
})
.on("mouseout", () => {
    tooltip.style("opacity", 0);
})
.on("click", (event, d) => {
    activeApartmant = d
    drawPriceChart(weekends,d)
    const content = `
<strong>Cijena:</strong> €${parseFloat(d.realSum).toFixed(2)}<br>
<strong>Tip:</strong> ${d.room_type}<br>
<strong>Cijena preko tjedna:</strong>${parseFloat(findMatchingWeekendPrice(d.lat,d.lng)).toFixed(2)}<br>
<strong>Kapacitet:</strong> ${parseInt(d.person_capacity)}<br>
<strong>Superhost:</strong> ${d.host_is_superhost== "True" ? "Da" : "Ne"}<br>
<strong>Ocjena gostiju:</strong> ${d.guest_satisfaction_overall}<br>
<strong>Posjeduje privatnu sobu:</strong> ${
d.room_private === "True" ? "Da" : "Ne"
}<br>
`;
    openDetails(content);
});
});
d3.csv("paris_weekdays.csv").then((data) => {
weekdays=data
weekdaysAll=data
g.selectAll("gWeekdays")
.data(weekdays)
.enter()
.append("circle")
.attr("class", "circle-weekdays")
.attr("cx", (d) => projection([+d.lng, +d.lat])[0])
.attr("cy", (d) => projection([+d.lng, +d.lat])[1])
.attr("r", 3)
.attr("fill", "orange")
.attr("opacity", 0.6)
.style("cursor", "pointer")
.style("display", "none")
.on("mouseover", (event, d) => {
    tooltip
    .style("opacity", 1)
    .html(`Cijena: €${parseFloat(d.realSum).toFixed(2)}`);
})
.on("mousemove", (event) => {
    tooltip
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 20 + "px");
})
.on("mouseout", () => {
    tooltip.style("opacity", 0);
})
.on("click", (event, d) => {
    activeApartmant = d
    drawPriceChart(weekdays,activeApartmant)
    const content = `
<strong>Cijena:</strong> €${parseFloat(d.realSum).toFixed(2)}<br>
<strong>Tip:</strong> ${d.room_type}<br>
<strong>Cijena preko vikenda:</strong>${parseFloat(findMatchingWeekendPrice(d.lat,d.lng)).toFixed(2)}<br>
<strong>Kapacitet:</strong> ${parseInt(d.person_capacity)}<br>
<strong>Superhost:</strong> ${d.host_is_superhost== "True" ? "Da" : "Ne"}<br>
<strong>Ocjena gostiju:</strong> ${d.guest_satisfaction_overall}<br>
<strong>Posjeduje privatnu sobu:</strong> ${
d.room_private === "True" ? "Da" : "Ne"
}<br>
`;
    openDetails(content);
});
});

d3.csv("hospital.csv").then((data) => {
const hospitals = g
.selectAll("g.hospital")
.data(data)
.enter()
.append("g")
.attr("class", "hospital")
.attr("transform", (d) => {
    const [x, y] = projection([+d.longitude, +d.latitude]);
    return `translate(${x},${y})`;
})
.on("mouseover", (event, d) => {
    tooltip
    .style("opacity", 1)
    .html(`<strong>${d.name}</strong><br>${d.address}`);
})
.on("mousemove", (event) => {
    tooltip
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 20 + "px");
})
.on("mouseout", () => {
    tooltip.style("opacity", 0);
});
hospitals
.append("line")
.attr("x1", -5)
.attr("y1", 0)
.attr("x2", 5)
.attr("y2", 0)
.attr("stroke", "red")
.attr("stroke-width", 2)
.attr("opacity", 0.6);

hospitals
.append("line")
.attr("x1", 0)
.attr("y1", -5)
.attr("x2", 0)
.attr("y2", 5)
.attr("stroke", "red")
.attr("stroke-width", 2)
.attr("opacity", 0.6);
});
d3.csv("police.csv").then((data) => {
const policeStations = g
.selectAll("g.police")
.data(data)
.enter()
.append("g")
.attr("class", "police")
.attr("transform", (d) => {
    const [x, y] = projection([+d.longitude, +d.latitude]);
    return `translate(${x},${y})`;
})
.on("mouseover", (event, d) => {
    tooltip
    .style("opacity", 1)
    .html(`<strong>${d.name}</strong><br>${d.address}`);
})
.on("mousemove", (event) => {
    tooltip
    .style("left", event.pageX + 10 + "px")
    .style("top", event.pageY - 20 + "px");
})
.on("mouseout", () => {
    tooltip.style("opacity", 0);
});

policeStations
.append("rect")
.attr("x", -5)
.attr("y", -5)
.attr("width", 5)
.attr("height", 5)
.attr("fill", "blue")
.attr("opacity", 0.6)
.attr("stroke", "black")
.attr("stroke-width", 1);
});
const legend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(20, 20)");

legend.append("circle")
    .attr("cx", 0)
    .attr("cy", 0)
    .attr("r", 5)
    .attr("fill", "purple")
    .attr("opacity", 0.6);

legend.append("text")
    .attr("x", 80)
    .attr("y", 5)
    .text("Apartmani - vikend")
    .style("font-size", "12px")
    .attr("alignment-baseline", "middle");

legend.append("circle")
    .attr("cx", 0)
    .attr("cy", 20)
    .attr("r", 5)
    .attr("fill", "orange")
    .attr("opacity", 0.6);

legend.append("text")
    .attr("x", 80)
    .attr("y", 25)
    .text("Apartmani - tjedan")
    .style("font-size", "12px")
    .attr("alignment-baseline", "middle");
legend.append("circle")
    .attr("cx", 0)
    .attr("cy", 40)
    .attr("r", 5)
    .attr("fill", "brown")
    .attr("opacity", 0.6);

legend.append("text")
    .attr("x", 80)
    .attr("y", 45)
    .text("Apartmani - tjedan i vikend")
    .style("font-size", "12px")
    .attr("alignment-baseline", "middle");   
    

// Bolnice
legend.append("line")
    .attr("x1", -5)
    .attr("y1", 60)
    .attr("x2", 5)
    .attr("y2", 60)
    .attr("stroke", "red")
    .attr("stroke-width", 2)
    .attr("opacity", 0.6);

legend.append("line")
    .attr("x1", 0)
    .attr("y1", 55)
    .attr("x2", 0)
    .attr("y2", 65)
    .attr("stroke", "red")
    .attr("stroke-width", 2)
    .attr("opacity", 0.6);

legend.append("text")
    .attr("x", 80)
    .attr("y", 62)
    .text("Bolnice")
    .style("font-size", "12px")
    .attr("alignment-baseline", "middle");

// Policijske postaje
legend.append("rect")
    .attr("x", -5)
    .attr("y", 75)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", "blue")
    .attr("opacity", 0.6)
    .attr("stroke", "black")
    .attr("stroke-width", 1);

legend.append("text")
    .attr("x", 80)
    .attr("y", 83)
    .text("Policijske postaje")
    .style("font-size", "12px")
    .attr("alignment-baseline", "middle");

// Regije
legend.append("rect")
    .attr("x", -5)
    .attr("y", 95)
    .attr("width", 10)
    .attr("height", 10)
    .attr("fill", "#cccccc")
    .attr("stroke", "#333")
    .attr("stroke-width", 0.5);

legend.append("text")
    .attr("x", 80)
    .attr("y", 103)
    .text("Regije")
    .style("font-size", "12px")
    .attr("alignment-baseline", "middle")
