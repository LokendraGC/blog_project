<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tag extends Model
{
    protected $fillable = ['tag_name', 'short_description', 'image'];


    public function posts(): HasMany
    {
        return $this->hasMany(Post::class);
    }
}
