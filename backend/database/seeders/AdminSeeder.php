<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
         // 1. Create or get the admin role
        $adminRole = Role::firstOrCreate(['name' => 'admin']);

        // 2. Assign all permissions to the admin role
        $permissions = Permission::all();
        $adminRole->syncPermissions($permissions);

        // 3. Create or get the admin user
        $user = User::firstOrCreate(
            ['email' => 'gclokendra10@gmail.com'],
            [
                'name' => 'Admin',
                'password' => Hash::make('password123'),
                'username' => 'admin',
            ]
        );

        if (!$user->hasRole('admin')) {
            $user->assignRole('admin');
        }
    }

}
