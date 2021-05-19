'''
Column 1 : thickness of stratum
Column 2 : unit weight
Column 3 : friction angle if granular, cohesion if cohesive
There is no limit to the number of layers you can have here.
'''
input_soil_profile = [
  [7, 120, 3500],
  [3, 107, 32],
  [8, 115, 30],
  [10, 125, 1400],
  [10, 115, 30],
  [5, 117, 33],
  [5, 133, 1750],
  [3, 117, 32]
]

diameters_to_check = [2, 4, 6, 8]

#Don't check embedments shallower than the ignored depth, it will give you toe bearing values greater than zero.
embedments_to_check = [ 6, 10, 20, 30, 40, 50]

#Make sure that each stratum is evenly divided by your layer_thickness
layer_thickness = 1

#Make this value deeper than soil profile if no water is present
depth_to_water_table = 15

#Side friction is neglected until this depth
ignored_depth = 3

#True if drilled pier, False if driven displacement pile
Nq_toggle = True

#True if concrete or timber, False if steel
material = True

'''
1 : driven single H-pile
2 : driven single displacement pile
3 : driven single displacement tapered pile
4 : driven jetted pile
5 : drilled pier (technically less than 2 foot diameter)
'''
pile_type = 5

safety_factor_compression = 2
safety_factor_tension = 3