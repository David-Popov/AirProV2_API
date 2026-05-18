using API.DTOs;
using API.Validators.Auth;

namespace API.Tests.Validators.Auth;

public class RegisterDtoValidatorTests
{
    private readonly RegisterDtoValidator _validator = new();

    private static RegisterDto ValidDto() => new()
    {
        Email = "owner@example.com",
        Password = "Secret123",
        ConfirmPassword = "Secret123",
        FirstName = "Ivan",
        LastName = "Ivanov",
        PhoneNumber = "+359888123456",
        CompanyName = "Acme Klimat OOD",
        CompanyType = "LLC",
        Bulstat = "123456789",
        VatNumber = "BG123456789",
        CompanyPhone = "+359888654321",
        CompanyPostalCode = "1000",
    };

    [Fact]
    public void Valid_Dto_Passes()
    {
        _validator.Validate(ValidDto()).IsValid.Should().BeTrue();
    }

    [Fact]
    public void Mismatched_Passwords_Fail()
    {
        var dto = ValidDto();
        dto.ConfirmPassword = "Different1";

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterDto.ConfirmPassword));
    }

    [Theory]
    [InlineData("short")]              // < 6 chars
    [InlineData("nouppercase1")]        // no upper
    [InlineData("NOLOWERCASE1")]        // no lower
    [InlineData("NoDigitHere")]         // no digit
    public void Weak_Password_Fails(string password)
    {
        var dto = ValidDto();
        dto.Password = password;
        dto.ConfirmPassword = password;

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterDto.Password));
    }

    [Theory]
    [InlineData("12345678")]    // 8 digits — fails (must be 9 or 13)
    [InlineData("12345678901")] // 11 digits — fails
    [InlineData("abcdefghi")]   // 9 non-digits — fails
    public void Invalid_Bulstat_Fails(string bulstat)
    {
        var dto = ValidDto();
        dto.Bulstat = bulstat;

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterDto.Bulstat));
    }

    [Fact]
    public void Invalid_CompanyType_Fails()
    {
        var dto = ValidDto();
        dto.CompanyType = "MagicType";

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterDto.CompanyType));
    }

    [Theory]
    [InlineData("123456789")]      // missing BG prefix
    [InlineData("BG123")]          // too few digits
    [InlineData("BG12345678901")]  // too many digits (>10)
    public void Invalid_VatNumber_Fails(string vat)
    {
        var dto = ValidDto();
        dto.VatNumber = vat;

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterDto.VatNumber));
    }
}
