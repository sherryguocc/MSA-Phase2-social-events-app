using System.ComponentModel.DataAnnotations;
using backend.DTOs; 

namespace backend.Validation
{
    public class ValidAttendeeRangeAttribute : ValidationAttribute
    {
        protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
        {
            var dto = (EventDTO)validationContext.ObjectInstance;
            if (dto.MinAttendees > dto.MaxAttendees)
            {
                return new ValidationResult("MinAttendees cannot be greater than MaxAttendees.");
            }
            return ValidationResult.Success;
        }
    }
}
