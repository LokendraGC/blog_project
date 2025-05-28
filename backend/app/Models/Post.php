<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Post extends Model
{
    protected $fillable = ['title', 'short_description', 'feature_image', 'user_id', 'content'];

    public function tags():BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
