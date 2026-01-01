/**
 * AppVersionInfo Component
 * 
 * Displays current app version information in a compact, styled format.
 * Shows version number, platform, and build environment.
 */

import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Capacitor } from '@capacitor/core';
import { Info, DeviceMobile, Desktop, AppleLogo, AndroidLogo } from '@phosphor-icons/react';
import { getAppVersion, formatVersion, type AppVersion } from '../utils/version';

interface AppVersionInfoProps {
    showPlatform?: boolean;
    showBuildDate?: boolean;
    compact?: boolean;
}

const AppVersionInfo = ({
    showPlatform = true,
    showBuildDate = false,
    compact = false,
}: AppVersionInfoProps) => {
    const [versionInfo, setVersionInfo] = useState<AppVersion | null>(null);

    useEffect(() => {
        const loadVersion = async () => {
            try {
                const info = await getAppVersion();
                setVersionInfo(info);
            } catch (error) {
                console.warn('[AppVersionInfo] Failed to load version:', error);
            }
        };
        loadVersion();
    }, []);

    if (!versionInfo) {
        return null;
    }

    const getPlatformIcon = () => {
        switch (versionInfo.platform) {
            case 'android':
                return <AndroidLogo size={14} weight="fill" />;
            case 'ios':
                return <AppleLogo size={14} weight="fill" />;
            default:
                return Capacitor.isNativePlatform()
                    ? <DeviceMobile size={14} weight="fill" />
                    : <Desktop size={14} weight="fill" />;
        }
    };

    const getPlatformLabel = () => {
        switch (versionInfo.platform) {
            case 'android':
                return 'Android';
            case 'ios':
                return 'iOS';
            default:
                return 'Web';
        }
    };

    if (compact) {
        return (
            <Box
                sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '12px',
                    color: '#64748b',
                    fontFamily: "'JetBrains Mono', monospace",
                }}
            >
                <Info size={12} />
                {formatVersion(versionInfo.version, versionInfo.buildType)}
            </Box>
        );
    }

    return (
        <Box
            sx={{
                bgcolor: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid rgba(71, 85, 105, 0.6)',
                borderRadius: '6px',
                p: 2,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 1.5,
                }}
            >
                <Info size={18} weight="duotone" color="#60a5fa" />
                <Box
                    component="span"
                    sx={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#f8fafc',
                        fontFamily: "'Chivo', sans-serif",
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                    }}
                >
                    App Information
                </Box>
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: showPlatform ? '1fr 1fr' : '1fr',
                    gap: 1.5,
                }}
            >
                {/* Version */}
                <Box
                    sx={{
                        bgcolor: 'rgba(15, 23, 42, 0.4)',
                        border: '1px solid rgba(71, 85, 105, 0.4)',
                        borderRadius: '6px',
                        p: 1.5,
                    }}
                >
                    <Box
                        sx={{
                            fontSize: '10px',
                            color: '#64748b',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontFamily: "'JetBrains Mono', monospace",
                            mb: 0.5,
                        }}
                    >
                        Version
                    </Box>
                    <Box
                        sx={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#f8fafc',
                            fontFamily: "'JetBrains Mono', monospace",
                        }}
                    >
                        {formatVersion(versionInfo.version)}
                        {versionInfo.buildType === 'development' && (
                            <Box
                                component="span"
                                sx={{
                                    ml: 1,
                                    fontSize: '10px',
                                    px: 1,
                                    py: 0.25,
                                    bgcolor: 'rgba(245, 158, 11, 0.2)',
                                    color: '#fbbf24',
                                    borderRadius: '4px',
                                    textTransform: 'uppercase',
                                }}
                            >
                                Dev
                            </Box>
                        )}
                    </Box>
                </Box>

                {/* Platform */}
                {showPlatform && (
                    <Box
                        sx={{
                            bgcolor: 'rgba(15, 23, 42, 0.4)',
                            border: '1px solid rgba(71, 85, 105, 0.4)',
                            borderRadius: '6px',
                            p: 1.5,
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: '10px',
                                color: '#64748b',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontFamily: "'JetBrains Mono', monospace",
                                mb: 0.5,
                            }}
                        >
                            Platform
                        </Box>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#f8fafc',
                            }}
                        >
                            {getPlatformIcon()}
                            {getPlatformLabel()}
                        </Box>
                    </Box>
                )}

                {/* Build Date */}
                {showBuildDate && (
                    <Box
                        sx={{
                            bgcolor: 'rgba(15, 23, 42, 0.4)',
                            border: '1px solid rgba(71, 85, 105, 0.4)',
                            borderRadius: '6px',
                            p: 1.5,
                            gridColumn: showPlatform ? 'span 2' : 'span 1',
                        }}
                    >
                        <Box
                            sx={{
                                fontSize: '10px',
                                color: '#64748b',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                fontFamily: "'JetBrains Mono', monospace",
                                mb: 0.5,
                            }}
                        >
                            Build Date
                        </Box>
                        <Box
                            sx={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#f8fafc',
                                fontFamily: "'JetBrains Mono', monospace",
                            }}
                        >
                            {versionInfo.buildDate}
                        </Box>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default AppVersionInfo;
