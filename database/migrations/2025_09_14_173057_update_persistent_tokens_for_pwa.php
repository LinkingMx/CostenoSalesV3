<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Check if columns already exist before adding them
        if (! Schema::hasColumn('persistent_tokens', 'user_agent')) {
            Schema::table('persistent_tokens', function (Blueprint $table) {
                $table->text('user_agent')->nullable()->after('token');
            });
        }

        if (! Schema::hasColumn('persistent_tokens', 'ip_address')) {
            Schema::table('persistent_tokens', function (Blueprint $table) {
                $table->string('ip_address', 45)->nullable()->after('user_agent');
            });
        }

        if (! Schema::hasColumn('persistent_tokens', 'is_pwa')) {
            Schema::table('persistent_tokens', function (Blueprint $table) {
                $table->boolean('is_pwa')->default(false)->after('ip_address');
            });
        }

        // Add indexes only if they don't exist
        try {
            Schema::table('persistent_tokens', function (Blueprint $table) {
                $table->index(['user_id', 'expires_at'], 'idx_user_expires');
            });
        } catch (\Exception $e) {
            // Index might already exist
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('persistent_tokens', function (Blueprint $table) {
            if (Schema::hasColumn('persistent_tokens', 'user_agent')) {
                $table->dropColumn('user_agent');
            }
            if (Schema::hasColumn('persistent_tokens', 'ip_address')) {
                $table->dropColumn('ip_address');
            }
            if (Schema::hasColumn('persistent_tokens', 'is_pwa')) {
                $table->dropColumn('is_pwa');
            }

            try {
                $table->dropIndex('idx_user_expires');
            } catch (\Exception $e) {
                // Index might not exist
            }
        });
    }
};
