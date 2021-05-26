/*
Deep foundations starts on page 198 in NAVFAC_Dm7_02
Useful info starts on page 215
Chapter 5. Deep Foundations 7.2-177
*/

const UNIT_WEIGHT_WATER = 62.4;

/*
Lookup table for Nq. Referenced by phiToNq function.
form: phi: [{Nq for drilled Pier}, {Nq for driven Pile}]
*/
const NQ_LOOKUP_TABLE = {
    26: [5, 10],
    27: [6.5, 12.5],
    28: [8, 15],
    29: [9, 18],
    30: [10, 21],
    31: [12, 24],
    32: [14, 29],
    33: [17, 35],
    34: [21, 42],
    35: [25, 50],
    36: [30, 62],
    37: [38, 77],
    38: [43, 86],
    39: [60, 120],
    40: [72, 145]
};

const poundsToKips = (pounds) => pounds / 1000;

//Ultimate Load Capacity in Compression
const UltLoadCapComp = (skinFriction, endBearing) => skinFriction + endBearing;

class DeepFoundation {
    /*
    generalSoilProfile: An object containing the soil profile to be analyzed.
    The generalSoilProfile must have the keys in the example. 
    The values of each key in the generalSoilProfile must be arrays of equal length
    Example: {depthBottom: [5, 20],                                 //number, (ft)
              description: ["Loose Sand", "Medium Compact Sand"],   //string
              unitWeight: [115, 122],                               //number (pcf)
              phi: [30, 35],                                        //int from 26 to 40 OR 0
              cohesion: [0, 0]                                      //number >= 0
             }

    The generalSoilProfile is a 2-D array that is a list of soil layers and its properties.
    Example: [[5, "Loose Sand", 115, 30, 0],
              [20, "Medium Compact Sand", 122, 35, 0]]
    Index Key: 0: bottom depth (ft) (number)
               1: Description (string)
               2: unit weight (pcf) (number)
               3: phi (int between 26 and 40, or 0)
               4: cohesion: (psf) (number >= 0)

    groundwaterDepth: The depth to the groundwater table, (ft) >=0
    Make groundwaterDepth below bottom of deepest foundation to be analyzed if there is no groundwater

    increment: how small to make each calculation increment.
    increment should be evenly divided into every analyzed depth, depthBottom, groundwaterDepth
    Good practice is to set increment to 0.5 and all other depths to nearest 0.5

    ignoredDepth: Depth to ignore for skin friction purposes (ft). 3 is typical.

    material: Must be in ["Concrete", "Timber", "Steel"]

    pileType: Must be in ["Driven Single H-Pile", "Driven Single Displacement Pile",
                          "Driven Single Displacement Tapered Pile", "Driven Jetted Pile",
                          "Drilled Pile"]

    FS: Factor of Safety. Recommended to use 3
    */

    phiToContactFriction = (phi, material) => {
        /*
        Determines contact friction angle from phi
        delta = 0.75 * phi for Timber or Concrete
        delta = 20 for steel
        Source: page 216
        */
        switch (material) {
            case ("Timber"):
                return 0.75 * phi;
            case ("Concrete"):
                return 0.75 * phi;
            case ("Steel"):
                return 20;
            default:
                return 0;
        }
    }

    KhcFromPileType = {
        //maps Pile Type horizontal earth pressure coefficient in compression
        //source p216
        "Driven Single H-Pile" : 0.75,
        "Driven Single Displacement Pile" : 1.25,
        "Driven Single Displacement Tapered Pile" : 1.75,
        "Driven Jetted Pile" : 0.65,
        "Drilled Pile" : 0.7
    };

    KhtFromPileType = {
        //maps Pile Type horizontal earth pressure coefficient in tension
        //source p216
        "Driven Single H-Pile" : 0.4,
        "Driven Single Displacement Pile" : 0.8,
        "Driven Single Displacement Tapered Pile" : 1.15,
        "Driven Jetted Pile" : 0.45,
        "Drilled Pile" : 0.4
    };

    cohesionToAdhesion = (c, material) => {
        /*
        Converts cohesion (psf) to adhesion (psf) using empirical formula
        Recommended values are lower for Steel than for Timber or Concrete
        Source: RECOMMENDED VALUES OF ADHESION on FIGURE 2
        */
       switch (material) {
           case ("Timber"):
                if (c < 250) return c;
                else if (c < 500) { //adhesion is in range 250-480
                    return 250 + (c - 250) / 250 * 230;
                } else if (c < 1000) { //adhesion is in range 480-750
                    return 480 + (c - 500) / 500 * 270;
                } else if (c < 2000) { //adhesion is in range 750-950
                    return 750 + (c - 1000) / 1000 * 200;
                } else if (c < 4000) { //adhesion is in range 950-1300
                    return 950 + (c - 2000) / 2000 * 350;
                } else return 1300;
            case ("Concrete"):
                if (c < 250) return c;
                else if (c < 500) { //adhesion is in range 250-480
                    return 250 + (c - 250) / 250 * 230;
                } else if (c < 1000) { //adhesion is in range 480-750
                    return 480 + (c - 500) / 500 * 270;
                } else if (c < 2000) { //adhesion is in range 750-950
                    return 750 + (c - 1000) / 1000 * 200;
                } else if (c < 4000) { //adhesion is in range 950-1300
                    return 950 + (c - 2000) / 2000 * 350;
                } else return 1300;
            case ("Steel"):
                if (c < 250) return c;
                else if (c < 500) { //adhesion is in range 250-460
                    return 250 + (c - 250) / 250 * 210;
                } else if (c < 1000) { //adhesion is in range 460-700
                    return 460 + (c - 500) / 500 * 240;
                } else if (c < 2000) { //adhesion is in range 700-720
                    return 700 + (c - 1000) / 1000 * 20;
                } else if (c < 4000) { //adhesion is in range 720-750
                    return 720 + (c - 2000) / 2000 * 30;
                } else return 750; 
            default:
                return 0;
       }
    };

    phiToNq = (phi) => {
        /*
        Determine the bearing capacity factor Nq from the friction angle phi.
        phi must be in integer from 26 to 40 inclusive or 0.
        fdnType must be "Drilled Pier" or "Driven Pile".
        */
        if (phi == 0) return 0;
        else return (this.isDrilled) ? NQ_LOOKUP_TABLE[phi][0] :  NQ_LOOKUP_TABLE[phi][1];
    }

    cToNc = (depth, width) => {
        /*
        Calculates bearing capacity factor in cohesive soils.
        Source: FIGURE 2
        */
        let x = depth / width;
        return (x < 4) ? 6.29 + 1.88*x - 0.506*x**2 + 0.0632*x**3 - 0.0031*x**4 : 9;
    }

    createSoilProfile() {
        /*
        Breaks down the generalSoilProfile into a profile with many equal-sized layers with size increment. Includes all parameters that are independent of the pile
        Index key: 0: bottom depth (ft) (number)
                   1: description (string)
                   2: unitWeight (pcf) (number)
                   3: phi (degrees) (int between 26 and 40, or 0)
                   4: cohesion (psf) (number)
                   5: delta (soil-pile interface friction angle) (number)
                   6: adhesion (soil-pile interface) (number)
                   7: khc, horizontal earth pressure coefficient in compression
                   8: kht, horizontal earth pressure coefficient in tension
                   9: Nq, bearing capacity factor (friction)
                   10: vertical effective stress at bottom of layer (psf)
                   11: vertical effective stress at midpoint of layer (psf)

        */
       let depthBottom = [];
       let description = [];
       let unitWeight = [];
       let phi = [];
       let cohesion = [];
       let delta = []; //contact friction angle between soil and pile
       let adhesion = [];
       let Khc = [];
       let Kht = [];
       let Nq = [];

       let currentDepth = 0;
       this.generalSoilProfile.forEach(layer => {
           while (currentDepth < layer[0]) {
               currentDepth += this.increment;
               depthBottom.push(currentDepth);
               description.push(layer[1]);
               unitWeight.push(layer[2]);
               phi.push(layer[3]);
               cohesion.push(layer[4]);
               delta.push(this.phiToContactFriction(layer[3], this.material));
               adhesion.push(this.cohesionToAdhesion(layer[4], this.material));
               Khc.push(this.KhcFromPileType[this.pileType]);
               Kht.push(this.KhtFromPileType[this.pileType]);
               Nq.push(this.phiToNq(layer[3]));
           }
        //effStressBottom needs all unitWeights to be calculated first
        let effStressBottom = this.unitWeightToEffStressBottom(unitWeight);
        //effStressMid needs all unitWeights and effStressBottom to be calculated first
        let effStressMid = this.unitWeightToEffStressMid(unitWeight, effStressBottom);

        //combine all calculated properties into a new array (index keys noted above)
        let detailedSoilProfile = [depthBottom, description, unitWeight, phi,
                                cohesion, delta, adhesion,
                                Khc, Kht, Nq, effStressBottom, effStressMid];
        console.log(detailedSoilProfile);
        this.detailedSoilProfile = [...detailedSoilProfile];
        console.log(this.detailedSoilProfile);
        return;
       })

    }

    unitWeightToEffStressBottom = (unitWeights) => {
        /*
        Calculates vertical effective stress (psf) profile at bottom of each layer.
        unitWeights is an array of unitweights for each layer.
        Function also depends on this.increment, UNIT_WEIGHT_WATER, and this.groundwaterDepth
        */
        let effStressBottom = [];
        let currentDepth = this.increment;
        //Calculate eff stress for first layer
        if (this.groundwaterDepth < this.increment) {
            effStressBottom[0] = (unitWeights[0] - UNIT_WEIGHT_WATER) * this.increment;
        } else {
            effStressBottom[0] = unitWeights[0] * this.increment;
        }
        //Calculate eff stress for subsequent layers, accounting for groundwater
        for (let i=1; i<unitWeights.length; i++) {
            currentDepth += this.increment;
            effStressBottom[i] = (this.groundwaterDepth < currentDepth) ?
                                effStressBottom[i-1] + (unitWeights[i] - UNIT_WEIGHT_WATER) * this.increment :
                                effStressBottom[i-1] + unitWeights[i] * this.increment;
        }
        return effStressBottom;
    }

    unitWeightToEffStressMid = (unitWeights, effStressBottom) => {
        /*
        Calculates vertical effective stress (psf) profile at midpoint of each layer.
        unitWeights is an array of unitweights for each layer.
        effStressBottom is a list of eff stresses calculated using this.unitWeightToEffStressBottom
        Function also depends on this.increment, UNIT_WEIGHT_WATER, and this.groundwaterDepth
        */
       let effStressMid = [];
       let currentDepth = this.increment;
       //Calculate eff stress for first layer
       effStressMid[0] = (this.groundwaterDepth < currentDepth) ?
                        (unitWeights[0] - UNIT_WEIGHT_WATER) * (this.increment / 2) :
                        unitWeights[0] * (this.increment / 2);
        //Calculate eff stress for subsequent layers, accounting for groundwater
        for (let i=1; i<unitWeights.length; i++) {
            currentDepth += this.increment;
            effStressMid[i] = (this.groundwaterDepth < currentDepth) ?
                            effStressBottom[i-1] + (unitWeights[i] - UNIT_WEIGHT_WATER) * (this.increment / 2) :
                            effStressBottom[i-1] + unitWeights[i] * (this.increment / 2);
        }
        return effStressMid;

    }

    limitEffStressTo20B = (effStress, width, depth) => {
        /*
        Returns an object containing new effective stress profile (works with bottom or mid)
            and the boolean isLimited to show if a change has been made
        limiting the effective stress to the effective stress at a depth of 20*B
        This function needs to be called to check each pile against the limiting effective stress.
        */
        let limitingDepth = width * 20;
        let limitedEffStress = [];
        let isLimited = false;
        let currentDepth  = 0;
        for (let i=0; i<(Math.round(depth/this.increment)); i++) {
            currentDepth += this.increment;
            limitedEffStress[i] = (currentDepth > limitingDepth) ?
                                limitedEffStress[i-1] :
                                effStress[i];
        }
        //console.log(`limitEffStressTo20B went to a depth of ${currentDepth} with a limiting depth of ${limitingDepth} and width of ${width}`);
        if (currentDepth > limitingDepth) isLimited = true;
        return {limitedEffStress: limitedEffStress, isLimited: isLimited};
    }

    perimeter = (width) => {
        /*
        Calculates perimeter (circumference) of pile tip. Supports this.shape="circular" or "rectangular"
        Note: If type="rectangular", width must be an aray of length 2
        */
        switch (this.pileShape) {
            case ("circular"):
                return Math.PI * width;
            case("rectangular"):
                return 2 * (width[0] + width[1]);
            default:
                return 0;
        }
    }
    
    /*
    Granular Skin Friction
    Kh = Ratio of horizontal to vertical effective stress in compression or tension (Khc or Kht)
    P0 = Effective vertical stress (psf) over length (take average, or stress at midpoint)
    delta = contact friction angle (degrees) between soil and pile
    perimeter (or circumference) (ft)
    unit length (ft) (use this.increment)
    */
    granSkinFriction = (Kh, P0, delta, width) => {
        return Kh * P0 * Math.tan(delta * Math.PI / 180) * this.perimeter(width) * this.increment
    };

    /*
    cohesion Skin Friction
    adhesion (psf) * perimeter (ft) * unit length (ft) (use this.increment)
    */
    cohesiveSkinFriction = (adhesion, width) => adhesion * this.perimeter(width) * this.increment;

    skinFrictionProfile = (width, embedment, compression) => {
        /*
        Generate the skin friction profile for a specific pile (width, embedment)
        width must be a list with two numbers if this.shape is "rectangular"
        width must be a single number if this.shape is "circular"
        compression is a boolean, use true if analyzing incompression, false if in tension
        */
        let limitedEffStress = this.limitEffStressTo20B(this.detailedSoilProfile[11], width, embedment).limitedEffStress; //11:vertical eff stress at midpoint
        let Kh = compression ? this.detailedSoilProfile[7] : this.detailedSoilProfile[8]; //7: khc 8: kht
        let currentDepth = 0;
        let skinFrictionProfile = [];
        let numSkinFrictionLayers = (embedment / this.increment).toFixed();
        for (let i=0; i< numSkinFrictionLayers; i++) {
            currentDepth += this.increment;
            //push a skin friction of 0 if in ignored depth
            if (currentDepth <= this.ignoredDepth) skinFrictionProfile.push(0);
            else { //pushes either a granular or cohesive skin friction
                skinFrictionProfile.push((this.detailedSoilProfile[3][i] == 0) ? //3: phi
                                            this.cohesiveSkinFriction(this.detailedSoilProfile[6][i], width) : //6: adhesion
                                            this.granSkinFriction(Kh[i], limitedEffStress[i], this.detailedSoilProfile[5][i], width)); //5: delta
            }
       }
       return skinFrictionProfile;
    }

    area = (width) => {
        /*
        Calculates area of pile tip. Supports type="circular" or "rectangular"
        Note: If type="rectangular", width must be an aray of length 2
        */
        switch (this.pileShape) {
            case ("circular"):
                return Math.PI * (width / 2) ** 2;
            case("rectangular"):
                return width[0] * width[1];
            default:
                return 0;
        }
    }

    /*
    Cohesive End Bearing Load Capacity
    c = cohesion (psf)
    width = diameter or dimension of rectangular pile section (ft)
    depth = embedment depth (ft)
    */
    cohesiveEndBearing = (c, width, depth) => c * this.cToNc(depth, width) * this.area(width);

    /*
    Granular End Bearing Load Capacity
    Pt = Effective vertical stress at pile tip
        Pt should be limited to the Pt at a depth of 20B
    Nq = bearing capacity factor
    width = diameter or dimensions of rectangular section (ft)
    */
    granEndBearing = (Pt, Nq, width) => Pt * Nq * this.area(width);

    sublayerDepths = (depth) => {
        //generate a list of depths corresponding to the bottom of each sublayer for a given pile
        let depths = [];
        let currentDepth = this.increment;
        while (currentDepth <= depth) {
            depths.push(currentDepth);
            currentDepth += this.increment;
        }
        return depths;
    }

    analyzePile = (width, depth, compression) => {
        /*
        Analyze a pile with the given width and embedment depth
        return an object containing:
            detailedSoilProfile, with limited effective stress if applicable
            effectiveStressIsLimited: boolean indicating effective stress has been limited
            endBearing
            ultimateCapacity
            allowableCapacity
            groundwaterDepth
            ignoredDepth
            material
            pileType
            FS
        */
        //Create a list of depths corresponding to the bottom of each sublayer
        let depths = this.sublayerDepths(depth);
        //Create a list of effective stresses at the midpoint of each sublayer
        let limitedEffStressMid = this.limitEffStressTo20B(this.detailedSoilProfile[11], width, depth).limitedEffStress;
        //Only keep what we need
        limitedEffStressMid = limitedEffStressMid.slice(0,depths.length);
        //Create a list of effective stresses at the bottom of each sublayer
        let limitedEffStressBottom = this.limitEffStressTo20B(this.detailedSoilProfile[10], width, depth).limitedEffStress;
        limitedEffStressBottom = limitedEffStressBottom.slice(0,depths.length);
        //a boolean indicated if the effective stress was limited due to D>=20B
        let effectiveStressIsLimited = this.limitEffStressTo20B(this.detailedSoilProfile[10], width, depth).isLimited;
        //A list of incremental skin friction values for each sublayer
        let skinFrictionProfile = this.skinFrictionProfile(width, depth, compression);
        //Get the index for the sublayer the pile bears on
        let endBearingIndex = (depth / this.increment - 1).toFixed();
        //console.log(`endBearingIndex: ${endBearingIndex}`);
        let endBearing;
        //console.log(`granEndBearing params: ${limitedEffStressBottom[endBearingIndex]} ${this.detailedSoilProfile[9][parseInt(endBearingIndex)+1]} ${width}`);
        //console.log(this.detailedSoilProfile[9][parseInt(endBearingIndex)+1]);
        //Calculate the end bearing if compression pile, treats with either cohesive or granular formulation, end bearing is 0 in tension
        if (compression) {
            endBearing = (this.detailedSoilProfile[3][parseInt(endBearingIndex)+1] == 0) ?
                            this.cohesiveEndBearing(this.detailedSoilProfile[4][parseInt(endBearingIndex)+1], width, depth) :
                            this.granEndBearing(limitedEffStressBottom[endBearingIndex], this.detailedSoilProfile[9][parseInt(endBearingIndex)+1], width);
        } else {
            endBearing = 0;
        }
        //add up incremental skin frictions, get ultimate and allowable capacity
        let totalSkinFriction = skinFrictionProfile.reduce((a,b) => a+b);
        let ultimateCapacity = totalSkinFriction + endBearing;
        let allowableCapacity = ultimateCapacity / this.FS;
        return {
            width: width,
            depth: depth,
            compression: compression,
            depths: depths,
            limitedEffStressMid: limitedEffStressMid,
            limitedEffStressBottom: limitedEffStressBottom,
            effectiveStressIsLimited: effectiveStressIsLimited,
            skinFrictionProfile: skinFrictionProfile,
            endBearing: endBearing,
            totalSkinFriction: totalSkinFriction,
            ultimateCapacity: ultimateCapacity,
            allowableCapacity: allowableCapacity,
            FS: this.FS,
            groundwaterDepth: this.groundwaterDepth,
            ignoredDepth: this.ignoredDepth,
            material: this.material,
            pileType: this.pileType
       }
    }

    analyzePileGroup = (widths, depths) => {
        /* Call AnalyzePile for a set of widths and depths in tension and compression
        Pass in a list of valid widths and a list of valid depths
        Returns a list of analyzed pile objects
        */
        let analyzedPilesCompression = [];
        let analyzedPilesTension = [];
        for (let i=0; i<widths.length; i++) {
            for (let j=0; j<depths.length; j++) {
                analyzedPilesCompression.push(this.analyzePile(widths[i], depths[j], true));
                analyzedPilesTension.push(this.analyzePile(widths[i], depths[j], false));
            }
        }
        return analyzedPilesCompression.concat(analyzedPilesTension);
    }





    constructor(generalSoilProfile, groundwaterDepth, increment=0.5, ignoredDepth=3, material, pileType, FS=3) {
        this.generalSoilProfile = generalSoilProfile;
        this.groundwaterDepth = groundwaterDepth;
        this.increment = increment;
        this.ignoredDepth = ignoredDepth;
        this.material = material;
        this.pileType = pileType;
        this.pileShape = (pileType == "Driven Single H-Pile") ? "rectangular" : "circular";
        this.isDrilled = (pileType == "Drilled Pile") ? true : false;
        this.FS = FS;
        this.createSoilProfile(); //determines this.detailedSoilProfile
    }
}

function ultimateCapacityArray(analyzedPileGroup, widths, depths) {
    /* Collects the ultimate capacities from an analyzed pile group and returns an array for compression and for tension.
    Widths and depths could be extracted from the analyzedPileGroup,
    but it was easier to implement if we just pass them along here.
    Each array contains the information needed for the report to build a table.
    For example: [[widths], [depths], [ultCapWidth1], [ultCapWidth2]], [[widths], [depths], [ultCapWidth1], [ultCapWidth2]]
    In addition to a list of widths and a list of depths,
    There will be x lists of capacities, where x = number of widths.
    There will be y entries per list, where y = numer of depths.
    Returns a list of 2 2D arrays: [ultCompTable, ultTenTable]
    */

    //Begin with list of widths and list of depths
    let ultCompTable = [widths, depths];
    //Start looking at beginning of analyzedPileGroup
    let pileGroupIndex = 0;
    //Iterate over number of widths offset by 2
    for (let i=2; i<widths.length+2; i++) {
        //start a new array for that width
        ultCompTable.push([]);
        for (let j=0; j<depths.length; j++) {
            //add the next ultimate capacity to the list for this width
            ultCompTable[i].push(analyzedPileGroup[pileGroupIndex].ultimateCapacity);
            //go to the next analyzed pile
            pileGroupIndex++;
        }
    }
    //We have finished the compression piles and are now looking at the tension piles
    let ultTenTable = [widths, depths];
    for (let i=2; i<widths.length+2; i++) {
        ultTenTable.push([]);
        for (let j=0; j<depths.length; j++) {
            ultTenTable[i].push(analyzedPileGroup[pileGroupIndex].ultimateCapacity);
            pileGroupIndex++;
        }
    }
    return [ultCompTable, ultTenTable];
}

function allowableCapacityArray(analyzedPileGroup, widths, depths) {
    /* Collects the allowable capacities from an analyzed pile group and returns an array for compression and for tension.
    Widths and depths could be extracted from the analyzedPileGroup,
    but it was easier to implement if we just pass them along here.
    Each array contains the information needed for the report to build a table.
    For example: [[widths], [depths], [ultCapWidth1], [ultCapWidth2]], [[widths], [depths], [ultCapWidth1], [ultCapWidth2]]
    In addition to a list of widths and a list of depths,
    There will be x lists of capacities, where x = number of widths.
    There will be y entries per list, where y = numer of depths.
    Returns a list of 2 2D arrays: [allCompTable, allTenTable]
    */

    //Begin with list of widths and list of depths
    let allCompTable = [widths, depths];
    //Start looking at beginning of analyzedPileGroup
    let pileGroupIndex = 0;
    //Iterate over number of widths offset by 2
    for (let i=2; i<widths.length+2; i++) {
        //start a new array for that width
        allCompTable.push([]);
        for (let j=0; j<depths.length; j++) {
            //add the next ultimate capacity to the list for this width
            allCompTable[i].push(analyzedPileGroup[pileGroupIndex].allowableCapacity);
            //go to the next analyzed pile
            pileGroupIndex++;
        }
    }
    //We have finished the compression piles and are now looking at the tension piles
    let allTenTable = [widths, depths];
    for (let i=2; i<widths.length+2; i++) {
        allTenTable.push([]);
        for (let j=0; j<depths.length; j++) {
            allTenTable[i].push(analyzedPileGroup[pileGroupIndex].allowableCapacity);
            pileGroupIndex++;
        }
    }
    return [allCompTable, allTenTable];
}



///REACT COMPONENTS START HERE/////

//Welcome message to be displayed on startup
const WelcomeScreen = function() {
    return (
        <div>
            <h1>NAVFAC Deep Foundations Calculator</h1>
            <p>Welcome to my calculator. Here, there ought to be a paragraph of useful text explaining how to operate this program. When I find out how it works, I'll let you know. Click Start to get started.</p> 
        </div>
    );
};

class ResultsSummaryTable extends React.Component {
    /*
    Pass the summary table into the constructor.
    This should be modified to take in one table at a time and be called 4 times
    This works and I hate every line of it! - change language to be general
    */
    constructor(props) {
        super(props);
        this.state = {
            resultsTable: props.resultsTable,
            tableLabel: props.tableLabel
        };
        //console.log(this.state.ultCompTable);
    }

    render() {
         
        let widths = this.state.resultsTable[0]; //used for leftmost column
        let depths = this.state.resultsTable[1]; //used for top row
        //generates top row separately from other rows
        let headerRow = 
            <tr>
                <td></td>
                {depths.map(d => (<td>{d}</td>))}
            </tr>
        //console.log(widths);
        //console.log(depths);
        //pull results out of array
        let resultsRows = this.state.resultsTable.slice(2);
        console.log(resultsRows);
        //Create table rows from the results data, putting the width for that row 
        //in the first column
        let resultsTable = resultsRows.map((row, index) => (
            <tr>
                <td>
                    {widths[index]}
                </td>
                {row.map(item => (
                    <td>{poundsToKips(item).toFixed(1)}</td>
                ))}
            </tr>
        ));

        return (
            <div>
                <h3>{this.state.tableLabel} (kips)</h3>
                <h5>Embedment Depth (ft)</h5>
                <table> {/* This external table lets me put a label to the left of the widths column */}
                    <td>width (ft)
                    </td>
                    <td>
                        <table>{headerRow}{resultsTable}</table>
                    </td>
                </table>            
            </div>
        )
    }
}

class SummaryTablesPage extends React.Component {
    /*
    This element processes and displays summary tables for all widths and depths
    for compression and tension
    ultimate and allowable
    */
   constructor(props) {
       super(props);
       this.state = {
           ultCompTable: props.ultCompTable,
           ultTenTable: props.ultTenTable,
           allCompTable: props.allCompTable,
           allTenTable: props.allTenTable
       };
   }

   render() {
       return (
        <div class="summary-tables-page"> 
            <h2>Summary of load capacities</h2>
            {<ResultsSummaryTable resultsTable={this.state.ultCompTable} 
                                    tableLabel={"Ultimate capacity in compression"}/>}
            {<ResultsSummaryTable resultsTable={this.state.ultTenTable} 
                                    tableLabel={"Ultimate capacity in tension"}/>}                                    
            {<ResultsSummaryTable resultsTable={this.state.allCompTable} 
                                    tableLabel={"Allowable capacity in compression"}/>}
            {<ResultsSummaryTable resultsTable={this.state.allTenTable} 
                                    tableLabel={"Allowable capacity in tension"}/>}                                    
        </div>
        
       )
   }
}

let TEXT_BOX_SIZE = 10;

function getMaterialRadioValue() {
    /*
    reads material type radio button. Defaults to concrete
    */
    let element = document.getElementsByName('material-type');
    for(let i=0; i<element.length; i++) {
        if (element[i].checked) {
            return element[i].value;
        }
    }
    return 'Concrete';
}

function getPileTypeRadioValue() {
    /*
    reads pile type radio button. Defaults to drilled pier
    */
    let element = document.getElementsByName('pile-type');
    for(let i=0; i<element.length; i++) {
        if (element[i].checked) {
            return element[i].value;
        }
    }
    return 'Drilled Pile';
}

class ResultsAllPiles extends React.Component {
    /*
    iterate over each pile to display detailed results for each pile
    */
   constructor(props) {
       super(props);
       this.state = {
           piles: props.piles
       };
   };

   render() {
       let allPiles = this.state.piles.map(pile => (
           <div>
               <ResultsPile pile={pile}/>
               <br/>
           </div>
       ));
       return allPiles;
   }
}

class ResultsPile extends React.Component {
    /*
    Render the results for an individual pile
    Iterate through each pile using this component to display all piles
    */
    constructor(props) {
        super(props);
        this.state = {
            pile: props.pile
        };

    }

    render() {
        let results = [this.state.pile.depths, this.state.pile.limitedEffStressBottom,
                                this.state.pile.limitedEffStressMid, this.state.pile.skinFrictionProfile];
        console.log("Pile results table before transforming: ");
        console.log(results);
        let pileResultsTable = [];
        for (let i=0; i<results[0].length; i++) {
            let row = [];
            row.push((<td>{this.state.pile.depths[i]}</td>));
            row.push((<td>{this.state.pile.limitedEffStressBottom[i]}</td>));
            row.push((<td>{this.state.pile.limitedEffStressMid[i]}</td>));
            row.push((<td>{this.state.pile.skinFrictionProfile[i]}</td>));
            row = (<tr>{row}</tr>);
            pileResultsTable.push(row);
        }

        return (
            <div class="individual-pile">
                <h2>Individual Pile Results</h2>
                <table>
                    <tr>
                        <td>Foundation width (ft): </td>
                        <td>{this.state.pile.width}</td>
                    </tr>
                    <tr>
                        <td>Bearing depth (ft): </td>
                        <td>{this.state.pile.depth}</td>
                    </tr>
                    <tr>
                        <td>Evaluated in: </td>
                        <td>{this.state.pile.compression ? "Compression" : "Tension"}</td>
                    </tr>
                    <tr>
                        <td>Material: </td>
                        <td>{this.state.pile.material}</td>
                    </tr>
                    <tr>
                        <td>Pile Type: </td>
                        <td>{this.state.pile.pileType}</td>
                    </tr>
                    <tr>
                        <td>Groundwater Depth (ft): </td>
                        <td>{this.state.pile.groundwaterDepth}</td>
                    </tr>
                    <tr>
                        <td>Ignored Depth (ft): </td>
                        <td>{this.state.pile.ignoredDepth}</td>
                    </tr>
                    <tr>
                        <td>Effective stress limited to 20B: </td>
                        <td>{this.state.pile.effectiveStressIsLimited? "Yes" : "No"}</td>
                    </tr>
                    <tr>
                        <td>End bearing (kips): </td>
                        <td>{poundsToKips(this.state.pile.endBearing)}</td>
                    </tr>
                    <tr>
                        <td>Skin Friction (kips): </td>
                        <td>{poundsToKips(this.state.pile.totalSkinFriction)}</td>
                    </tr>
                    <tr>
                        <td>Ultimate capacity (kips): </td>
                        <td>{poundsToKips(this.state.pile.ultimateCapacity)}</td>
                    </tr>
                    <tr>
                        <td>Allowable capacity (kips): </td>
                        <td>{poundsToKips(this.state.pile.allowableCapacity)}</td>
                    </tr>
                </table>

                <table>
                    <tr>
                        <th>Depth (ft)</th>
                        <th>Eff. Stress Bottom (psf)</th>    
                        <th>Eff. Stress Midpoint (psf)</th>
                        <th>Incremental skin friction (psf)</th>                    
                    </tr>
                    {pileResultsTable}
                </table>
            </div>
        );
    }
}

class ResultsGeneral extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            analysisDetails: props.analysisDetails,
            profile: props.analysisDetails.detailedSoilProfile,
            fsComp: props.fsComp,
            fsTen: props.fsTen

        };
    }

    render() {
        //Generate a table containing the elements from detailedSoilProfile
        //start by transpose profile matrix
        let profile = this.state.profile[0].map((_, colIndex) => this.state.profile.map(row => row[colIndex]));

        let profileTable = profile.map((row, index) => (
            <tr>
                {row.map(item => (
                    <td>{item}</td>
                ))}
            </tr>
        ));

        console.log("rendering results");
        console.log(profile);
        console.log(this.state);
        return (
            <div class="general-results">
                <h3>GENERAL RESULTS</h3>
                <h4>Inputs</h4>
                <table>
                    <tr>
                        <td>Material: </td>
                        <td>{this.state.analysisDetails.material}</td>
                    </tr>
                    <tr>
                        <td>Pile type: </td>
                        <td>{this.state.analysisDetails.pileType}</td>
                    </tr>
                    <tr>
                        <td>Depth to groundwater (ft): </td>
                        <td>{this.state.analysisDetails.groundwaterDepth}</td>
                    </tr>
                    <tr>
                        <td>Ignored depth (ft): </td>
                        <td>{this.state.analysisDetails.ignoredDepth}</td>
                    </tr>
                    <tr>
                        <td>Sublayer increment (ft): </td>
                        <td>{this.state.analysisDetails.increment}</td>
                    </tr>
                    <tr>
                        <td>Factor of safety (compression): </td>
                        <td>{this.state.fsComp}</td>
                    </tr>
                    <tr>
                        <td>Factor of safety (tension): </td>
                        <td>{this.state.fsTen}</td>
                    </tr>
                </table>
                <table>
                    <tr>
                        <th>Depth (ft)</th>
                        <th>Layer Name</th>
                        <th>Unit Weight (pcf)</th>
                        <th>Friction Angle (degrees)</th>
                        <th>Cohesion (psf)</th>
                        <th>Delta (degrees)</th>
                        <th>Adhesion (psf)</th>
                        <th>Khc</th>
                        <th>Kht</th>
                        <th>Nq</th>
                        <th>Sigma-v (bottom of layer, psf)</th>
                        <th>Sigma-v (mid-layer, psf)</th>
                    </tr>

                    {profileTable}
                </table>
            </div>
        )
    }
}

class DataEntryForm extends React.Component {
    constructor(props) {
        super(props);
        if (DEBUG) this.state = DEBUG_DataEntry_STATE;
        else {
        this.state = {
            analyzed: false
        };
        };
        this.handleAnalyze = this.handleAnalyze.bind(this);
        this.handleLayerNames = this.handleLayerNames.bind(this);
        this.handleLayerBottoms = this.handleLayerBottoms.bind(this);
        this.handleUnitWeights = this.handleUnitWeights.bind(this);
        this.handleFrictionAngles = this.handleFrictionAngles.bind(this);
        this.handleCohesions = this.handleCohesions.bind(this);
        this.handleGroundwaterDepth = this.handleGroundwaterDepth.bind(this);
        this.handleIncrement = this.handleIncrement.bind(this);
        this.handleIgnoredDepth = this.handleIgnoredDepth.bind(this);
        this.handleAnalysisDepths = this.handleAnalysisDepths.bind(this);
        this.handleAnalysisWidths = this.handleAnalysisWidths.bind(this);
        this.handleFSCompression = this.handleFSCompression.bind(this);
        this.handleFSTension = this.handleFSTension.bind(this);
        this.handleMaterial = this.handleMaterial.bind(this);
        this.handlePileType = this.handlePileType.bind(this);
    }

    /*
    The handle functions continuously update the state of the DataEntryForm to contain the contents of the input boxes. 
    Validation is not yet implemented
    */
    
    handleAnalyze() {
        this.setState(state => ({
            ...state,
            analyzed: true
        }));
    };

    handleLayerNames(event) {
        this.setState(state => ({
            ...state,
            layerNames: event.target.value
        }), () => {
            console.log(`layerNames: ${this.state.layerNames}`);
        });
    };

    handleLayerBottoms(event) {
        this.setState(state => ({
            ...state,
            layerBottoms: event.target.value
        }), () => {
            console.log(`layerBottoms: ${this.state.layerBottoms}`);
        });
    };

    handleUnitWeights(event) {
        this.setState(state => ({
            ...state,
            unitWeights: event.target.value
        }), () => {
            console.log(`unitWeights: ${this.state.unitWeights}`);
        });
    };

    handleFrictionAngles(event) {
        this.setState(state => ({
            ...state,
            frictionAngles: event.target.value
        }), () => {
            console.log(`frictionAngles: ${this.state.frictionAngles}`);
        });
    };

    handleCohesions(event) {
        this.setState(state => ({
            ...state,
            cohesions: event.target.value
        }), () => {
            console.log(`cohesions: ${this.state.cohesions}`);
        });
    };

    handleGroundwaterDepth(event) {
        this.setState(state => ({
            ...state,
            groundwaterDepth: event.target.value
        }), () => {
            console.log(`groundwaterDepth: ${this.state.groundwaterDepth}`);
        });
    };

    handleIncrement(event) {
        this.setState(state => ({
            ...state,
            increment: event.target.value
        }), () => {
            console.log(`increment: ${this.state.increment}`);
        });
    };

    handleIgnoredDepth(event) {
        this.setState(state => ({
            ...state,
            ignoredDepth: event.target.value
        }), () => {
            console.log(`ignoredDepth: ${this.state.ignoredDepth}`);
        });
    };

    handleAnalysisDepths(event) {
        this.setState(state => ({
            ...state,
            analysisDepths: event.target.value
        }), () => {
            console.log(`analysisDepths: ${this.state.analysisDepths}`);
        });
    };

    handleAnalysisWidths(event) {
        this.setState(state => ({
            ...state,
            analysisWidths: event.target.value
        }), () => {
            console.log(`analysisWidths: ${this.state.analysisWidths}`);
        });
    };

    handleFSCompression(event) {
        this.setState(state => ({
            ...state,
            fsCompression: event.target.value
        }), () => {
            console.log(`fsCompression: ${this.state.fsCompression}`);
        });
    };

    handleFSTension(event) {
        this.setState(state => ({
            ...state,
            fsTension: event.target.value
        }), () => {
            console.log(`fsTension: ${this.state.fsTension}`);
        });
    };

    handleMaterial() {
        this.setState(state => ({
            ...state,
            material: getMaterialRadioValue()
        }), () => {
            console.log(`material: ${this.state.material}`);
        })
    }

    handlePileType() {
        this.setState(state => ({
            ...state,
            pileType: getPileTypeRadioValue()
        }), () => {
            console.log(`pileType: ${this.state.pileType}`);
        })
    }

    render() {
        return(
            <div id="data-entry-form">
                <h1>Data entry form</h1>
                {/* Input fields for soil properties */}
                <h2>Soil Profile Information</h2>
                <div class="row">
                    <div class="col-md-4 input-label">
                        <span><b>Layer name</b> (Put each layer name in double quotes, separated by a comma and a space. Ex: "loose sand", "stiff clay")</span>
                    </div>
                    <div class="col-md-3 input-box">
                        <input id='xxx' onChange={this.handleLayerNames} autoComplete='off' size={TEXT_BOX_SIZE}></input>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4 input-label">
                        <span><b>Depth</b> to bottom of layer in feet (numbers separated by commas, Ex: 5, 8)</span>
                    </div>
                    <div class="col-md-3 input-box">
                        <input id='xxx' onChange={this.handleLayerBottoms} autoComplete='off' size={TEXT_BOX_SIZE}></input>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4 input-label">
                        <span><b>Unit Weight</b> (pcf)</span>
                    </div>
                    <div class="col-md-3 input-box">
                        <input id='xxx' onChange={this.handleUnitWeights} autoComplete='off' size={TEXT_BOX_SIZE}></input>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4 input-label">
                        <span><b>Friction Angle</b> (degrees)</span>
                    </div>
                    <div class="col-md-3 input-box">
                        <input id='xxx' onChange={this.handleFrictionAngles} autoComplete='off' size={TEXT_BOX_SIZE}></input>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4 input-label">
                        <span><b>Cohesion</b> (psf)</span>
                    </div>
                    <div class="col-md-3 input-box">
                        <input id='xxx' onChange={this.handleCohesions} autoComplete='off' size={TEXT_BOX_SIZE}></input>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4 input-label">
                        <span><b>Depth to groundwater</b> (ft)</span>
                    </div>
                    <div class="col-md-3 input-box">
                        <input id='xxx' onChange={this.handleGroundwaterDepth} autoComplete='off' size={TEXT_BOX_SIZE}></input>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4 input-label">
                        <span><b>Sublayer Increment</b> (ft)</span>
                    </div>
                    <div class="col-md-3 input-box">
                        <input id='xxx' onChange={this.handleIncrement} autoComplete='off' size={TEXT_BOX_SIZE}></input>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4 input-label">
                        <span><b>Ignored Depth</b> (ft)</span>
                    </div>
                    <div class="col-md-3 input-box">
                        <input id='xxx' onChange={this.handleIgnoredDepth} autoComplete='off' size={TEXT_BOX_SIZE}></input>
                    </div>
                </div>              

                <h2>Material and Pile Type</h2>
                {/*Radio buttons for material type selection */}
                <p>Material</p>
                <input type='radio' id='concrete-radio-button' onClick={this.handleMaterial} name='material-type' value='Concrete'></input>
                <label for='Concrete'>Concrete</label>

                <input type='radio' id='timber-radio-button' onClick={this.handleMaterial} name='material-type' value='Timber'></input>
                <label for='Timber'>Timber</label>

                <input type='radio' id='steel-radio-button' onClick={this.handleMaterial} name='material-type' value='Steel'></input>
                <label for='Steel'>Steel</label>

                {/*Radio buttons for pile type selection */}
                <p>Material</p>
                <input type='radio' id='driven-single-h-pile' onClick={this.handlePileType} name='pile-type' value='Driven Single H-Pile'></input>
                <label for='Driven Single H-Pile'>Driven Single H-Pile</label>

                <input type='radio' id='driven-single-displacement-pile' onClick={this.handlePileType} name='pile-type' value='Driven Single Displacement Pile'></input>
                <label for='Driven Single Displacement Pile'>Driven Single Displacement Pile</label>

                <input type='radio' id='driven-single-displacement-tapered-pile' onClick={this.handlePileType} name='pile-type' value='Driven Single Displacement Tapered Pile'></input>
                <label for='Driven Single Displacement Tapered Pile'>Driven Single Displacement Tapered Pile</label>

                <input type='radio' id='driven-jetted-pile' onClick={this.handlePileType} name='pile-type' value='Driven Jetted Pile'></input>
                <label for='Driven Jetted Pile'>Driven Jetted Pile</label>

                <input type='radio' id='drilled-pile' onClick={this.handlePileType} name='pile-type' value='Drilled Pile'></input>
                <label for='Drilled Pile'>Drilled Pile</label>

                {/* Input fields for analysis depths and widths */}
                <div class="row">
                    <div class="col-md-4 input-label">
                        <span><b>Analysis Depths</b> (ft)</span>
                    </div>
                    <div class="col-md-3 input-box">
                        <input id='xxx' onChange={this.handleAnalysisDepths} autoComplete='off' size={TEXT_BOX_SIZE}></input>
                    </div>
                </div>       

                <div class="row">
                    <div class="col-md-4 input-label">
                        <span><b>Analysis Widths</b> (ft)</span>
                    </div>
                    <div class="col-md-3 input-box">
                        <input id='xxx' onChange={this.handleAnalysisWidths} autoComplete='off' size={TEXT_BOX_SIZE}></input>
                    </div>
                </div>
                <p><i>Note: If using an H pile, widths must be entered as tuples corresponding to the width and depth of the H pile. This analysis assumes a full plugged condition. Ex: (6,7), (6,7.5), (7,8)</i></p>

                <div class="row">
                    <div class="col-md-4 input-label">
                        <span><b>Factor of Safety in Compression</b> (Recommended 2)</span>
                    </div>
                    <div class="col-md-3 input-box">
                        <input id='xxx' onChange={this.handleFSCompression} autoComplete='off' size={TEXT_BOX_SIZE}></input>
                    </div>
                </div>

                <div class="row">
                    <div class="col-md-4 input-label">
                        <span><b>Factor of Safety in Tension</b> (Recommended 3)</span>
                    </div>
                    <div class="col-md-3 input-box">
                        <input id='xxx' onChange={this.handleFSTension} autoComplete='off' size={TEXT_BOX_SIZE}></input>
                    </div>
                </div>

                {/* I spent a million years figuring this out. Need to use an arrow function
                to pass parameters back to the parent element.  */}
                <button class='btn btn-primary' id='analyze' 
                    onClick={()=>this.props.sendResults(
                        this.state.layerNames,
                        this.state.layerBottoms,
                        this.state.unitWeights,
                        this.state.frictionAngles,
                        this.state.cohesions,
                        this.state.groundwaterDepth,
                        this.state.increment,
                        this.state.ignoredDepth,
                        this.state.material,
                        this.state.pileType,
                        this.state.analysisDepths,
                        this.state.analysisWidths,
                        this.state.fsCompression,
                        this.state.fsTension)}>Analyze pile set</button>
                {/*
                {this.state.analyzed && <h1>The pile is pretend analyzed.</h1>}
                */}

            </div>
        )
    }

}



function convertParamListsToSoilProfile (depths, descriptions, unitWeights, phis, cohesions) {
    /*
    converts 5 lists of soil profile parameters from DeepFoundationsApp state to a soil profile understandable to the DeepFoundation class
    */
    let parsedDescriptions = descriptions.split(', ');
    let soilProfile = [];
    for (let i=0; i<depths.length; i++) {
        soilProfile.push([depths[i], parsedDescriptions[i], unitWeights[i], phis[i], cohesions[i]]);
    }
    return soilProfile;
}


class DeepFoundationsApp extends React.Component {
    constructor(props) {
        super(props);
        //debug lines below
        if (DEBUG) this.state = DEBUG_DeepFoundationsApp_STATE;
        else 
        //debug lines above
        this.state = {
            welcome: true, 
            dataEntryForm: false, 
            diplayResultsGeneral: false,
            resultsSummary: false
        };
        this.handleStart = this.handleStart.bind(this);
        this.acceptInput = this.acceptInput.bind(this);
        
    }

    handleStart() {
        this.setState(state => ({
            ...state,
            welcome: false,
            dataEntryForm: true
        }));
    };

    acceptInput(layerNames, layerDepths, unitWeights,
                frictionAngles, cohesions, groundwaterDepth,
                sublayerIncrement, ignoredDepth,
                material, pileType,
                analysisDepths, analysisWidths,
                fsComp, fsTen) {
        /*
        This method does basically everything... This takes the input from the data entry sheet, does all the calulations, enters all of the pertinent information into the app's state, and then passes along all of that information to the various components that render the results.

        ////////////////No data entry validation has been implemented at this time.////////////////
        */
       //adds to the state all of the data entry that was passed in by the data entry sheet
        console.log("Accepting input parameters from the data entry sheet and adding them to parent state");
        this.setState(state => ({
            ...state,
            layerNames: layerNames,
            layerDepths: layerDepths,
            unitWeights: unitWeights,
            frictionAngles: frictionAngles,
            cohesions: cohesions,
            groundwaterDepth: groundwaterDepth,
            sublayerIncrement: sublayerIncrement,
            ignoredDepth: ignoredDepth,
            material: material,
            pileType: pileType,
            analysisDepths: analysisDepths,
            analysisWidths: analysisWidths,
            fsComp: fsComp,
            fsTen: fsTen
        }), () => { //callback function executes after updating state
            console.log("accepted input. Updated State:");
            console.log(this.state);
            //Create a generalSoilProfile for use with the DeepFoundation class by parsing the inputted data
            let generalSoilProfile = convertParamListsToSoilProfile(this.state.layerDepths,
                                                                    this.state.layerNames,
                                                                    this.state.unitWeights,
                                                                    this.state.frictionAngles,
                                                                    this.state.cohesions);
            console.log("generated general soil profile");
            console.log(generalSoilProfile);
            //Create the DeepFoundation object 
            let foundation = new DeepFoundation(generalSoilProfile,
                                                this.state.groundwaterDepth,
                                                this.state.sublayerIncrement,
                                                this.state.ignoredDepth,
                                                this.state.material,
                                                this.state.pileType,
                                                this.state.fsComp);
            //analyze all of the piles entered by the user
            let pileAnalyses = foundation.analyzePileGroup(this.state.analysisWidths, this.state.analysisDepths);
            //parse the summary tables for use in the summary table component
            let ultSummaryTables = ultimateCapacityArray(pileAnalyses, this.state.analysisWidths, this.state.analysisDepths);
            let allSummaryTables = allowableCapacityArray(pileAnalyses, this.state.analysisWidths, this.state.analysisDepths);
            console.log("Completed analysis of all piles");
            console.log(pileAnalyses);
            //update state with all of the analysis details
            //tell app to render the results
            this.setState(state => ({
                ...state,
                analysisDetails: foundation,
                pileAnalyses: pileAnalyses,
                ultCompTable: ultSummaryTables[0],
                ultTenTable: ultSummaryTables[1],
                allCompTable: allSummaryTables[0],
                allTenTable: allSummaryTables[1],
                displayResultsGeneral: true, 
                displaySummaryTables: true
            }), () => {
                console.log("Added completed analysis to state");
                console.log(this.state);
            })
        })
    }

    render() {
        return (
            <div>
                {/* Welcome message that explains how to use the app */}
                {this.state.welcome && <div><WelcomeScreen/>
                <button class='btn btn-primary' id='start' onClick={this.handleStart} onClick={this.acceptInput}>Start</button></div>}

                {this.state.dataEntryForm && <DataEntryForm sendResults={this.acceptInput}/>}
                {this.state.displayResultsGeneral && <ResultsGeneral analysisDetails={this.state.analysisDetails}
                                                                    fsComp={this.state.fsComp}
                                                                    fsTen={this.state.fsTen}/>}
                {this.state.displaySummaryTables && <SummaryTablesPage ultCompTable={this.state.ultCompTable}
                                                                        ultTenTable={this.state.ultTenTable}
                                                                        allCompTable={this.state.allCompTable}
                                                                        allTenTable={this.state.allTenTable}/>}
                {this.state.displaySummaryTables && <ResultsAllPiles piles={this.state.pileAnalyses}/>}
                
            </div>
        );
    }
}



//debug settings
let DEBUG = true;
let DEBUG_DeepFoundationsApp_STATE = {
    welcome: false,
    dataEntryForm: true,
    resultsSummary: true
};

let DEBUG_DataEntry_STATE = {
    layerNames: '"L SP", "MC SP", "L SP", "M CL"',
    layerBottoms: [13, 25, 28, 45],
    unitWeights: [100, 110, 125, 110, 110],
    frictionAngles: [27, 35, 27, 0],
    cohesions: [0, 0, 0, 600],
    groundwaterDepth: 4,
    increment: 1,
    ignoredDepth: 5,
    material: "Concrete",
    pileType: "Drilled Pile",
    analysisDepths: [10, 15, 20, 30, 35, 40],
    analysisWidths: [0.5, 1.5],
    fsCompression: 3,
    fsTension: 3
}

ReactDOM.render(<DeepFoundationsApp/>, document.getElementById('NAVFAC-deep-foundations-app'));

//todo:
//Make the data entry form handle data entry properly
//remove the input for separate factors of safety for compression and tension
//clean up output (91.000000000000000001 => 91.0)
//add output for end bearing calc -> this may require additional logic in the backend