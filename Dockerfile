# ══════════════════════════════════════════════════════════════════════════════
# PlotCAD API — Production Dockerfile
# Multi-stage build with security hardening
# ══════════════════════════════════════════════════════════════════════════════

# ── Build stage ──────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0-alpine AS build
WORKDIR /src

# Copy project files first for layer caching (restore only re-runs on .csproj changes)
COPY WebApi/PlotCAD.Common/PlotCAD.Common.csproj           WebApi/PlotCAD.Common/
COPY WebApi/PlotCAD.Domain/PlotCAD.Domain.csproj           WebApi/PlotCAD.Domain/
COPY WebApi/PlotCAD.Application/PlotCAD.Application.csproj WebApi/PlotCAD.Application/
COPY WebApi/PlotCAD.Infrastructure/PlotCAD.Infrastructure.csproj WebApi/PlotCAD.Infrastructure/
COPY WebApi/PlotCAD.WebApi/PlotCAD.WebApi.csproj           WebApi/PlotCAD.WebApi/

RUN dotnet restore WebApi/PlotCAD.WebApi/PlotCAD.WebApi.csproj \
    --runtime linux-musl-x64

# Copy source and publish (self-contained trimmed for smaller image)
COPY WebApi/ WebApi/
RUN dotnet publish WebApi/PlotCAD.WebApi/PlotCAD.WebApi.csproj \
    -c Release \
    -o /app/publish \
    --no-restore \
    --runtime linux-musl-x64 \
    --self-contained false

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS runtime

# Security: minimal attack surface
RUN apk add --no-cache \
      curl \
      icu-libs \
    && addgroup -g 1001 -S plotcad \
    && adduser -u 1001 -S -G plotcad -s /sbin/nologin plotcad

WORKDIR /app
COPY --from=build --chown=plotcad:plotcad /app/publish .

# RSA keys mounted at runtime via volume — never baked into the image
# Required mounts: /app/secrets/private.pem and /app/secrets/public.pem

USER plotcad

ENV ASPNETCORE_URLS=http://+:5000 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_EnableDiagnostics=0 \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false

EXPOSE 5000

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -sf http://localhost:5000/health || exit 1

ENTRYPOINT ["dotnet", "PlotCAD.WebApi.dll"]
