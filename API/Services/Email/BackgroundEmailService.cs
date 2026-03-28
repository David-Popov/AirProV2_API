using System.Threading.Channels;

namespace API.Services.Email;

public interface IBackgroundEmailQueue
{
    void QueueEmail(Func<IServiceProvider, Task> emailWork);
    Task<Func<IServiceProvider, Task>> DequeueAsync(CancellationToken cancellationToken);
}

public class BackgroundEmailQueue : IBackgroundEmailQueue
{
    private readonly Channel<Func<IServiceProvider, Task>> _queue;
    private readonly ILogger<BackgroundEmailQueue> _logger;

    public BackgroundEmailQueue(ILogger<BackgroundEmailQueue> logger)
    {
        _logger = logger;
        // Unbounded channel — never silently drops emails.
        // Under extreme load the queue grows in memory rather than losing emails.
        _queue = Channel.CreateUnbounded<Func<IServiceProvider, Task>>();
    }

    public void QueueEmail(Func<IServiceProvider, Task> emailWork)
    {
        ArgumentNullException.ThrowIfNull(emailWork);

        if (!_queue.Writer.TryWrite(emailWork))
        {
            // TryWrite on an unbounded channel never returns false unless the channel
            // is completed (i.e., app is shutting down). Log so it is visible.
            _logger.LogError("Failed to enqueue email work item — the email channel may be closed (shutdown in progress)");
        }
    }

    public async Task<Func<IServiceProvider, Task>> DequeueAsync(CancellationToken cancellationToken)
    {
        return await _queue.Reader.ReadAsync(cancellationToken);
    }
}

public class BackgroundEmailProcessor : BackgroundService
{
    private readonly IBackgroundEmailQueue _queue;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<BackgroundEmailProcessor> _logger;

    public BackgroundEmailProcessor(
        IBackgroundEmailQueue queue,
        IServiceScopeFactory scopeFactory,
        ILogger<BackgroundEmailProcessor> logger)
    {
        _queue = queue;
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var emailWork = await _queue.DequeueAsync(stoppingToken);

                using var scope = _scopeFactory.CreateScope();
                await emailWork(scope.ServiceProvider);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to send background email");
            }
        }
    }
}
