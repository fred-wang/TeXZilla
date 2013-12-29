<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
<!--
  Copyright (C) 2013-2014 Frederic Wang

  This program is free software: you can redistribute it and/or modify
  it under the terms of the GNU General Public License as published by
  the Free Software Foundation, either version 3 of the License, or
  (at your option) any later version.

  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  GNU General Public License for more details.

  You should have received a copy of the GNU General Public License
  along with this program.  If not, see <http://www.gnu.org/licenses/>.
-->  
  <xsl:strip-space elements="*"/>
  <xsl:output method="text"/>

  <xsl:template match="charlist"><xsl:apply-templates select="character"/></xsl:template>
  <xsl:template match="character">
    <xsl:if test="operator-dictionary">
      <xsl:value-of select="@id"/>
      <xsl:text> </xsl:text>
      <xsl:text>MO</xsl:text>
      <xsl:if test="operator-dictionary/@accent">
        <xsl:text>A</xsl:text>
      </xsl:if>
      <xsl:if test="operator-dictionary/@fence">
        <xsl:text>F</xsl:text>
      </xsl:if>
      <xsl:if test="operator-dictionary/@largeop">
        <xsl:text>L</xsl:text>
      </xsl:if>
      <xsl:if test="operator-dictionary/@movablelimits">
        <xsl:text>M</xsl:text>
      </xsl:if>
      <xsl:if test="operator-dictionary/@stretchy">
        <xsl:text>S</xsl:text>
      </xsl:if>
      <xsl:text>_</xsl:text>
      <xsl:if test="operator-dictionary[@form = 'infix']">
        <xsl:text>INF</xsl:text>
      </xsl:if>
      <xsl:if test="operator-dictionary[@form = 'prefix']">
        <xsl:text>PRE</xsl:text>
      </xsl:if>
      <xsl:if test="operator-dictionary[@form = 'postfix']">
        <xsl:text>POS</xsl:text>
      </xsl:if>
      <xsl:text>_</xsl:text>
      <xsl:if test="operator-dictionary/@priority">
        <xsl:value-of select="operator-dictionary/@priority"/>
      </xsl:if>
      <xsl:text> </xsl:text>
      <xsl:value-of select="latex"/>
      <xsl:text> </xsl:text>
      <xsl:value-of select="mathlatex"/>
      <xsl:text> </xsl:text>
      <xsl:value-of select="AMS"/>
      <xsl:text> </xsl:text>
      <xsl:value-of select="IIEE"/>
      <xsl:text>&#xa;</xsl:text>
    </xsl:if>
    <xsl:if test="unicodedata/@mathclass and not(operator-dictionary)">
      <xsl:value-of select="@id"/>
      <xsl:text> </xsl:text>
      <xsl:value-of select="unicodedata/@mathclass"/>
      <xsl:text>__</xsl:text>
      <xsl:text> </xsl:text>
      <xsl:value-of select="latex"/>
      <xsl:text> </xsl:text>
      <xsl:value-of select="mathlatex"/>
      <xsl:text> </xsl:text>
      <xsl:value-of select="AMS"/>
      <xsl:text> </xsl:text>
      <xsl:value-of select="IIEE"/>
      <xsl:text>&#xa;</xsl:text>
    </xsl:if>
  </xsl:template>

</xsl:stylesheet>
