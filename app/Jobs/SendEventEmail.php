<?php

namespace App\Jobs;

use App\Mail\EventMail;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendEventEmail implements ShouldQueue
{
    use Queueable;

    /**
     * @param  string|array<int, string>  $recipients
     */
    public function __construct(
        public string|array $recipients,
        public string $renderedSubject,
        public string $renderedBody,
    ) {}

    public function handle(): void
    {
        Mail::to($this->recipients)
            ->send(new EventMail(
                renderedSubject: $this->renderedSubject,
                renderedBody: $this->renderedBody,
            ));
    }
}
