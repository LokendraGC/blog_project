<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Post extends Model
{
    protected $fillable = ['title', 'short_description', 'feature_image', 'user_id', 'content'];
    protected $appends = ['likes_count'];

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class);
    }


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function savedByUser(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'post_user')->withTimestamps();
    }

    public function likedByUsers()
    {
        return $this->belongsToMany(User::class, 'post_user_likes')->withTimestamps();
    }

    public function getLikesCountAttribute()
    {
        return $this->likedByUsers()->count();
    }
}
