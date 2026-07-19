using System.Reflection;
using BlazorApp.Shared;
using Microsoft.AspNetCore.Components;

namespace BlazorApp.Tests;

public class SampleCatalogTests
{
    // Every @page directive compiles into a RouteAttribute on the generated component class, so
    // reflecting over the built assembly catches a SampleCatalog entry pointing at a route no
    // page actually serves, without hard-coding a path to the Pages folder's source files.
    private static readonly HashSet<string> RoutedPages = typeof(SampleCatalog).Assembly
        .GetTypes()
        .SelectMany(t => t.GetCustomAttributes<RouteAttribute>())
        .Select(a => a.Template.TrimStart('/'))
        .ToHashSet();

    public static TheoryData<SampleInfo> Samples() => new(SampleCatalog.Samples);

    [Fact]
    public void Routes_are_unique()
    {
        var duplicates = SampleCatalog.Samples
            .GroupBy(s => s.Route)
            .Where(g => g.Count() > 1)
            .Select(g => g.Key);

        Assert.Empty(duplicates);
    }

    [Fact]
    public void Every_sample_route_has_a_matching_page()
    {
        var missing = SampleCatalog.Samples
            .Select(s => s.Route)
            .Where(route => !RoutedPages.Contains(route));

        Assert.Empty(missing);
    }

    [Theory]
    [MemberData(nameof(Samples))]
    public void Sample_metadata_fields_are_populated(SampleInfo sample)
    {
        Assert.False(string.IsNullOrWhiteSpace(sample.Route));
        Assert.False(string.IsNullOrWhiteSpace(sample.Title));
        Assert.False(string.IsNullOrWhiteSpace(sample.Category));
        Assert.False(string.IsNullOrWhiteSpace(sample.Icon));
        Assert.False(string.IsNullOrWhiteSpace(sample.Description));
        Assert.NotEmpty(sample.Tags);
    }

    [Fact]
    public void ByCategory_accounts_for_every_sample_exactly_once()
    {
        var total = SampleCatalog.ByCategory.Sum(g => g.Count());

        Assert.Equal(SampleCatalog.Samples.Count, total);
    }
}
