<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Post extends Model
{
    protected $fillable = ['title', 'short_description', 'feature_image', 'user_id', 'tag_id', 'content'];

      public function tag(): BelongsTo
    {
        return $this->belongsTo(Tag::class);
    }
}
