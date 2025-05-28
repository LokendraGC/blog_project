<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tag extends Model
{
    protected $fillable = ['tag_name', 'short_description', 'image', 'user_id'];


    public function posts():BelongsToMany
    {
        return $this->belongsToMany(Post::class);
    }


    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
