using Microsoft.EntityFrameworkCore;

namespace API.Common;

/// <summary>
    /// Represents a paged list of items with pagination metadata
    /// </summary>
    /// <typeparam name="T">The type of items in the list</typeparam>
    public class PagedList<T>(List<T> items, int page, int pageSize, int totalCount)
    {
        public List<T> Items { get; } = items;
        public int Page { get; } = page;
        public int PageSize { get; } = pageSize;
        public int TotalCount { get; } = totalCount;
        public bool HasNextPage => Page * PageSize < TotalCount;
        public bool HasPreviousPage => Page > 1;
        
        /// <summary>
        /// Total number of pages
        /// </summary>
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        
        /// <summary>
        /// Creates a paged list from an IQueryable source
        /// </summary>
        /// <param name="query">The queryable source</param>
        /// <param name="page">Page number (1-based)</param>
        /// <param name="pageSize">Number of items per page</param>
        /// <returns>A paged list with the requested items</returns>
        public static async Task<PagedList<T>> CreateAsync(IQueryable<T> query, int page, int pageSize)
        {
            var totalCount = await query.CountAsync();
            var items = totalCount == 0 
                ? new List<T>()
                : await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
                
            return new PagedList<T>(items, page, pageSize, totalCount);
        }

        /// <summary>
        /// Creates a paged list from PageParameters
        /// </summary>
        /// <param name="query">The queryable source</param>
        /// <param name="pageParameters">Page parameters containing page number and size</param>
        /// <returns>A paged list with the requested items</returns>
        public static async Task<PagedList<T>> CreateAsync(IQueryable<T> query, PageParameters pageParameters)
        {
            if (pageParameters == null)
                throw new ArgumentNullException(nameof(pageParameters));

            return await CreateAsync(query, pageParameters.PageNumber, pageParameters.PageSize);
        }

        /// <summary>
        /// Creates an empty paged list
        /// </summary>
        /// <returns>An empty paged list</returns>
        public static PagedList<T> Empty()
        {
            return new PagedList<T>(new List<T>(), 1, 20, 0);
        }
    }