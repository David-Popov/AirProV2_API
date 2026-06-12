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
    [InlineData("short")]
    [InlineData("nouppercase1")]
    [InlineData("NOLOWERCASE1")]
    [InlineData("NoDigitHere")]
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
    [InlineData("12345678")]
    [InlineData("12345678901")]
    [InlineData("abcdefghi")]
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
    [InlineData("123456789")]
    [InlineData("BG123")]
    [InlineData("BG12345678901")]
    public void Invalid_VatNumber_Fails(string vat)
    {
        var dto = ValidDto();
        dto.VatNumber = vat;

        var result = _validator.Validate(dto);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == nameof(RegisterDto.VatNumber));
    }
}
