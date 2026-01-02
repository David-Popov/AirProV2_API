namespace API.Models;

/// <summary>
/// Units of measure for inventory items
/// </summary>
public enum UnitOfMeasure
{
    Pieces,      // Individual items (e.g., brackets, screws)
    Meters,      // Length in meters (e.g., copper pipes)
    Centimeters, // Length in centimeters
    Kilograms,   // Weight in kilograms
    Grams,       // Weight in grams
    Liters,      // Volume in liters (e.g., refrigerant)
    Milliliters, // Volume in milliliters
    Rolls,       // Rolls of material (e.g., insulation tape)
    Boxes,       // Boxes of items
    Sets         // Sets/kits of items
}
